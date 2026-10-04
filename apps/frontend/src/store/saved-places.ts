import { useMemo } from 'react'
import { useDocument } from '@automerge/react'
import { useRootDocUrl } from '@/contexts/root-doc-context'
import type { RootDoc } from '@/store/automerge/types'
import { withoutUndefined } from '@/store/automerge/without-undefined'
import { generateUUID, type Airport, type Place, type PlaceType, type PlaceTypes, type SavedPlace } from '@/types'

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

// A root document made before these maps existed lacks them; there is no migration.
// Read the map back after creating it: the assignment returns the plain object, not the document's.
function placesIn(d: RootDoc, type: PlaceType): Record<string, SavedPlace<Place>> {
  if (!d[mapOf[type]]) d[mapOf[type]] = {}
  return d[mapOf[type]]
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

// Airport keys are IATA codes and site keys are uuids, so one key names at most one place.
export function useSavedPlace(placeKey: string | undefined): SavedPlaceEntry | undefined {
  return useSavedPlaces().find((entry) => entry.key === placeKey)
}

export function useSavedPlaceMutations() {
  const [, changeDoc] = useRootDoc()

  return {
    add<T extends PlaceType>(type: T, place: PlaceTypes[T]): string {
      const key = type === 'Airport' ? (place as Airport).code : generateUUID()
      changeDoc((d) => {
        placesIn(d, type)[key] = withoutUndefined(place)
      })
      return key
    },

    update<T extends PlaceType>(type: T, key: string, place: PlaceTypes[T]) {
      changeDoc((d) => {
        const places = placesIn(d, type)
        const archived = places[key]?.archived
        places[key] = withoutUndefined(place)
        if (archived) places[key].archived = true
      })
    },

    archive(type: PlaceType, key: string) {
      changeDoc((d) => {
        placesIn(d, type)[key].archived = true
      })
    },

    restore(type: PlaceType, key: string) {
      changeDoc((d) => {
        delete placesIn(d, type)[key].archived
      })
    },

    remove(type: PlaceType, key: string) {
      changeDoc((d) => {
        delete placesIn(d, type)[key]
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
