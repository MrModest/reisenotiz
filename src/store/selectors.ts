import { useMemo } from 'react'
import { useTripsStore } from './trips-store'
import { Accommodation, Flight, getFlightTimelineItems, getHotelTimelineItems, TripItem, UUID } from '@/types'
import { TimelineElement } from '@/components/ui/timeline'

/**
 * Get all trips as an array
 */
export function useTrips() {
  const tripsRecord = useTripsStore(state => state.trips)
  return useMemo(() => Object.values(tripsRecord), [tripsRecord])
}

/**
 * Get a single trip by ID
 */
export function useTrip(tripId: UUID) {
  return useTripsStore(state => state.getTripById(tripId))
}

/**
 * Get a single trip item by ID
 */
export function useTripItem(itemId: UUID) {
  return useTripsStore(state => state.getTripItemById(itemId))
}

/**
 * Get all trip items for a specific trip
 */
export function useTripItems(tripId: UUID) {
  const tripItemsRecord = useTripsStore(state => state.tripItems)
  return useMemo(() => {
    return Object.values(tripItemsRecord).filter(item => item.tripId === tripId)
  }, [tripItemsRecord, tripId])
}

/**
 * Get timeline elements for a specific trip
 */
export function useTimelineElements(tripId: UUID) {
  const tripItems = useTripItems(tripId)
  return getTimelineElements(tripItems)
}

/* ============= Helpers ============= */

function getTimelineElements(tripItems: TripItem[]): TimelineElement[] {
  const elements: TimelineElement[] = []

  for (const item of tripItems) {
    switch (item.type) {
      case 'Flight':
        elements.push(...getFlightTimelineItems(item as Flight))
        break
      case 'Accommodation':
        elements.push(...getHotelTimelineItems(item as Accommodation))
        break
      default:
        console.warn(`Unsupported trip item type for timeline: ${item.type}`)
    }
  }

  // Sort by datetime ascending (oldest first)
  elements.sort((a, b) =>
    a.datetime.instant.localeCompare(b.datetime.instant)
  )

  return elements
}
