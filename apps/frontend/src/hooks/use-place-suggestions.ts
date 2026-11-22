import { useEffect, useState } from 'react'
import { placeSuggestions } from '@/lib/places/search'
import { placeProvider, type PlaceProvider } from '@/services'
import { useSavedPlaces } from '@/store'
import type { PlaceType, PlaceTypes } from '@/types'

// The provider's answer for the current query only. An answer is kept with the query it answers,
// and one that arrives after the query moved on is dropped, so a slow `BER` never replaces `LIS`.
export function useProviderResults<T extends PlaceType>(provider: PlaceProvider, type: T, query: string): PlaceTypes[T][] {
  const [answer, setAnswer] = useState<{ type: T; query: string; places: PlaceTypes[T][] }>()

  useEffect(() => {
    let current = true
    void provider.search(type, query).then((places) => {
      if (current) setAnswer({ type, query, places })
    })
    return () => {
      current = false
    }
  }, [provider, type, query])

  return answer?.type === type && answer.query === query ? answer.places : []
}

// Saved places show at once; the provider's results join them when they arrive
export function usePlaceSuggestions<T extends PlaceType>(type: T, query: string): PlaceTypes[T][] {
  const saved = useSavedPlaces().filter((place): place is PlaceTypes[T] => place.type === type)
  return placeSuggestions(saved, useProviderResults(placeProvider, type, query), query)
}
