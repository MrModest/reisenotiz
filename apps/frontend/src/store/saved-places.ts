import { useMemo } from 'react'
import { useDocument } from '@automerge/react'
import { useRootDocUrl } from '@/contexts/root-doc-context'
import type { RootDoc } from '@/store/automerge/types'
import { withoutUndefined } from '@/store/automerge/without-undefined'
import { generateUUID, type Airport, type Place, type PlaceType, type PlaceTypes, type SavedPlace } from '@/types'

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

// Every check runs inside the change against the document as it is then, not as a render saw it:
// another device may have added or deleted the place in between.
// - `add` never overwrites: a key already saved is refused as `key-taken`.
// - `update` never recreates: a place deleted meanwhile is refused as `not-found`.
// - `archive`, `restore` and `remove` of a missing place change nothing.
export function useSavedPlaceMutations() {
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

    remove(type: PlaceType, key: string) {
      changeDoc((d) => {
        const places = d[mapOf[type]]
        if (places?.[key]) delete places[key]
      })
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
