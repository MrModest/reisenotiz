import { useMemo } from 'react'
import { toTimelineElements } from '@/components/trip-items/registry'
import { buildTimelineDays, type TimelineDay } from '@/lib/timeline'
import type { TripItem, TripItemType } from '@/types'

export function useTimelineDays(items: TripItem[], filter?: TripItemType): TimelineDay[] {
  return useMemo(() => buildTimelineDays(toTimelineElements(items), filter), [items, filter])
}
