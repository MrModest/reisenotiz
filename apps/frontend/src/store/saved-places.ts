import { useMemo } from 'react'
import { interpretAsDocumentId, useDocument, useDocuments, useRepo, type Repo } from '@automerge/react'
import { useRootDocUrl } from '@/contexts/root-doc-context'
import type { RootDoc, TripDoc } from '@/store/automerge/types'
import { withoutUndefined } from '@/store/automerge/without-undefined'
import {
  generateUUID,
  type Accommodation,
  type Airport,
  type Flight,
  type Place,
  type PlaceType,
  type PlaceTypes,
  type SavedPlace,
  type TripItem,
  type TripItemType,
} from '@/types'

export type PlaceSaveError = 'key-taken' | 'not-found'
export type PlaceSaveResult = { ok: true; key: string } | { ok: false; reason: PlaceSaveError }

// The type of a place is known from which map it was read; nothing stored says it.
export type SavedPlaceEntry = {
  [K in PlaceType]: { type: K; key: string; place: SavedPlace<PlaceTypes[K]> }
}[PlaceType]

const mapOf = {
  Airport: 'savedAirports',
  AccommodationSite: 'savedAccommodationSites',
} as const satisfies Record<PlaceType, keyof RootDoc>

function useRootDoc() {
  return useDocument<RootDoc>(useRootDocUrl(), { suspense: true })
}

// Creates a map an older root document lacks. Read it back after creating it: the assignment
// returns the plain object, not the document's.
function placesIn(d: RootDoc, type: PlaceType): Record<string, SavedPlace<Place>> {
  if (!d[mapOf[type]]) d[mapOf[type]] = {}
  return d[mapOf[type]]!
}

export function useSavedPlaces(): SavedPlaceEntry[] {
  const [doc] = useRootDoc()
  return useMemo(
    () => [
      ...Object.entries(doc.savedAirports ?? {}).map(([key, place]) => ({ type: 'Airport' as const, key, place })),
      ...Object.entries(doc.savedAccommodationSites ?? {}).map(([key, place]) => ({
        type: 'AccommodationSite' as const,
        key,
        place,
      })),
    ],
    [doc.savedAirports, doc.savedAccommodationSites],
  )
}

// Resolves a link against places already read, where a hook cannot run
export function findSavedPlace<T extends PlaceType>(places: SavedPlaceEntry[], type: T, key: string): SavedPlace<PlaceTypes[T]> | undefined {
  return places.find((entry) => entry.type === type && entry.key === key)?.place as SavedPlace<PlaceTypes[T]> | undefined
}

// Airport keys are IATA codes and site keys are uuids, so one key names at most one place.
export function useSavedPlace(placeKey: string | undefined): SavedPlaceEntry | undefined {
  return useSavedPlaces().find((entry) => entry.key === placeKey)
}

// Exhaustive like the trip item registry, which the store cannot import, so a new type does not
// compile until it says what it links
const linkedPlaceKeysByType: { [K in TripItemType]: (item: Extract<Flight | Accommodation, { type: K }>) => string[] } = {
  Flight: (flight) => [flight.departure.placeKey, flight.arrival.placeKey],
  Accommodation: (stay) => [stay.placeKey],
}

// Items of a type this build does not know link nothing
function linkedPlaceKeys(item: TripItem): string[] {
  if (!Object.prototype.hasOwnProperty.call(linkedPlaceKeysByType, item.type)) return []
  return (linkedPlaceKeysByType[item.type] as (item: TripItem) => string[])(item)
}

// How many trip items link each place, by key; an item linking a place twice counts once
export function countPlaceUsage(tripDocs: Iterable<TripDoc>): Map<string, number> {
  const usage = new Map<string, number>()
  for (const doc of tripDocs) {
    for (const item of Object.values(doc.tripItems)) {
      for (const key of new Set(linkedPlaceKeys(item))) usage.set(key, (usage.get(key) ?? 0) + 1)
    }
  }
  return usage
}

export function usePlaceUsage(): Map<string, number> {
  const [doc] = useRootDoc()
  const [tripDocs] = useDocuments<TripDoc>(Object.values(doc.tripIndex), { suspense: true })
  return useMemo(() => countPlaceUsage(tripDocs.values()), [tripDocs])
}

// The trip files this device has loaded; one it has not cannot be counted, which the
// `Unknown place` fallback covers
function residentTripDocs(repo: Repo, tripIndex: RootDoc['tripIndex']): TripDoc[] {
  return Object.values(tripIndex).flatMap((url) => {
    const handle = repo.handles[interpretAsDocumentId(url)]
    return handle?.isReady() ? [handle.doc() as TripDoc] : []
  })
}

// Every check runs inside the change against the document as it is then, not as a render saw it:
// another device may have added or deleted the place in between.
// - `add` never overwrites: a key already saved is refused as `key-taken`.
// - `update` never recreates: a place deleted meanwhile is refused as `not-found`.
// - `remove` refuses a place a trip item links, returning false.
// - `archive`, `restore` and `remove` of a missing place change nothing.
export function useSavedPlaceMutations() {
  const repo = useRepo()
  const [, changeDoc] = useRootDoc()

  return {
    add<T extends PlaceType>(type: T, place: PlaceTypes[T]): PlaceSaveResult {
      const key = type === 'Airport' ? (place as Airport).code : generateUUID()
      let result: PlaceSaveResult = { ok: false, reason: 'key-taken' }
      changeDoc((d) => {
        const places = placesIn(d, type)
        if (places[key]) return
        places[key] = withoutUndefined(place)
        result = { ok: true, key }
      })
      return result
    },

    update<T extends PlaceType>(type: T, key: string, place: PlaceTypes[T]): PlaceSaveResult {
      let result: PlaceSaveResult = { ok: false, reason: 'not-found' }
      changeDoc((d) => {
        const places = d[mapOf[type]]
        const archived = places?.[key]?.archived
        if (!places?.[key]) return
        places[key] = withoutUndefined(place)
        if (archived) places[key].archived = true
        result = { ok: true, key }
      })
      return result
    },

    archive(type: PlaceType, key: string) {
      changeDoc((d) => {
        const place = d[mapOf[type]]?.[key]
        if (place) place.archived = true
      })
    },

    restore(type: PlaceType, key: string) {
      changeDoc((d) => {
        const place = d[mapOf[type]]?.[key]
        if (place) delete place.archived
      })
    },

    remove(type: PlaceType, key: string): boolean {
      let removed = true
      changeDoc((d) => {
        if (countPlaceUsage(residentTripDocs(repo, d.tripIndex)).get(key)) {
          removed = false
          return
        }
        const places = d[mapOf[type]]
        if (places?.[key]) delete places[key]
      })
      return removed
    },

    // Picking a dictionary airport saves it before anything uses it; one already saved is kept as is.
    materialiseAirport(airport: Airport): string {
      changeDoc((d) => {
        placesIn(d, 'Airport')[airport.code] ??= withoutUndefined(airport)
      })
      return airport.code
    },
  }
}
