import { useMemo } from 'react'
import { useDocument } from '@automerge/react'
import { useRootDocUrl } from '@/contexts/root-doc-context'
import type { RootDoc } from '@/store/automerge/types'
import { isCustomPlace, type AnyPlace, type TripItem, type TripItemType, type TripItemTypes } from '@/types'
import { overwrite } from './automerge/overwrite'

function useRootDoc() {
  return useDocument<RootDoc>(useRootDocUrl(), { suspense: true })
}

export function useSavedPlaces(): AnyPlace[] {
  const [doc] = useRootDoc()
  return useMemo(() => Object.values(doc.savedPlaces), [doc.savedPlaces])
}

export function useSavedPlace(id: string | undefined): AnyPlace | undefined {
  const [doc] = useRootDoc()
  return id ? doc.savedPlaces[id] : undefined
}

// Exhaustive like the trip item registry, which the store cannot import, so a new type does not
// compile until it says which places it holds
const placesByType: { [K in TripItemType]: (item: TripItemTypes[K]) => AnyPlace[] } = {
  Flight: (flight) => [flight.departure.place, flight.arrival.place],
  Accommodation: (stay) => [stay.place],
}

// Items of a type this build does not know hold none
export function placesOf(item: Omit<TripItem, 'id'>): AnyPlace[] {
  if (!Object.prototype.hasOwnProperty.call(placesByType, item.type)) return []
  return (placesByType[item.type] as (item: Omit<TripItem, 'id'>) => AnyPlace[])(item)
}

// Saving a trip item keeps its custom places as templates; a provider's places are never saved
export function saveCustomPlaces(d: RootDoc, places: AnyPlace[]): void {
  for (const place of places) {
    if (isCustomPlace(place)) overwrite(d.savedPlaces, place.id, place)
  }
}

// `save` writes the place under its id, adding it or overwriting the one there. `remove` of a
// missing place changes nothing. Nothing in a trip refers to a saved place, so both always succeed.
export function useSavedPlaceMutations() {
  const [, changeDoc] = useRootDoc()

  return {
    save(place: AnyPlace) {
      changeDoc((d) => saveCustomPlaces(d, [place]))
    },

    remove(id: string) {
      changeDoc((d) => {
        delete d.savedPlaces[id]
      })
    },
  }
}
