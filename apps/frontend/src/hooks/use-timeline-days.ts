import { useMemo } from 'react'
import { toTimelineElements } from '@/components/trip-items/registry'
import { buildTimelineDays, type TimelineDay } from '@/lib/timeline'
import { useSavedPlaces } from '@/store'
import type { TripItem, TripItemType } from '@/types'

// The places are a dependency: without them a row keeps a place's old name after it is edited
export function useTimelineDays(items: TripItem[], filter?: TripItemType): TimelineDay[] {
  const places = useSavedPlaces()
  return useMemo(() => buildTimelineDays(toTimelineElements(items, places), filter), [items, places, filter])
}
