import { useDocument, useDocuments, useRepo } from '@automerge/react'
import type { Trip, TripItem } from '@/types'
import { Accommodation, Flight, getFlightTimelineItems, getHotelTimelineItems } from '@/types'
import { TimelineElement } from '@/components/ui/timeline'
import { generateUUID } from '@/types/common/uuid'
import { useRootDocUrl } from '@/contexts/root-doc-context'
import type { RootDoc, TripDoc } from './automerge/types'

function useRootDoc() {
  return useDocument<RootDoc>(useRootDocUrl(), { suspense: true })
}

function useTripDoc(tripId: string) {
  const [rootDoc] = useRootDoc()
  const url = rootDoc.tripIndex[tripId]
  if (!url) throw new Error(`Trip ${tripId} not found — caller must gate on useTripExists`)
  return useDocument<TripDoc>(url, { suspense: true })
}

/* ============= Existence gates ============= */

export function useTripExists(tripId: string): boolean {
  const [rootDoc] = useRootDoc()
  return tripId in rootDoc.tripIndex
}

export function useTripItemExists(tripId: string, itemId: string): boolean {
  const [tripDoc] = useTripDoc(tripId)
  return itemId in tripDoc.tripItems
}

/* ============= Reads ============= */

export function useTrips(): Trip[] {
  const [rootDoc] = useRootDoc()
  const tripUrls = Object.values(rootDoc.tripIndex)
  const [tripDocs] = useDocuments<TripDoc>(tripUrls, { suspense: true })

  const trips: Trip[] = []
  for (const doc of tripDocs.values()) trips.push(doc.trip)
  trips.sort((a, b) => b.startDate.instant.localeCompare(a.startDate.instant))
  return trips
}

export function useTrip(tripId: string): Trip {
  const [tripDoc] = useTripDoc(tripId)
  return tripDoc.trip
}

export function useTripItems(tripId: string): TripItem[] {
  const [tripDoc] = useTripDoc(tripId)
  return Object.values(tripDoc.tripItems)
}

export function useTripItem(tripId: string, itemId: string): TripItem {
  const [tripDoc] = useTripDoc(tripId)
  const item = tripDoc.tripItems[itemId]
  if (!item) throw new Error(`TripItem ${itemId} not found — caller must gate on useTripItemExists`)
  return item
}

export function useTimelineElements(tripId: string): TimelineElement[] {
  const tripItems = useTripItems(tripId)
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

  elements.sort((a, b) => a.datetime.instant.localeCompare(b.datetime.instant))
  return elements
}

/* ============= Writes ============= */

export function useCreateTrip() {
  const repo = useRepo()
  const [, changeRoot] = useRootDoc()
  return (trip: Omit<Trip, 'id'>): string => {
    const id = generateUUID()
    const handle = repo.create<TripDoc>({ trip: { ...trip, id }, tripItems: {} })
    changeRoot((d) => {
      d.tripIndex[id] = handle.url
    })
    return id
  }
}

export function useUpdateTrip(tripId: string) {
  const [, changeTripDoc] = useTripDoc(tripId)
  return (updates: Partial<Trip>): void => {
    changeTripDoc((d) => {
      Object.assign(d.trip, updates)
    })
  }
}

export function useDeleteTrip() {
  const [, changeRoot] = useRootDoc()
  return (id: string): void => {
    changeRoot((d) => {
      delete d.tripIndex[id]
    })
  }
}

export function useCreateTripItem(tripId: string) {
  const [, changeTripDoc] = useTripDoc(tripId)
  return (item: Omit<TripItem, 'id'>): string => {
    const id = generateUUID()
    changeTripDoc((d) => {
      d.tripItems[id] = { ...item, id } as TripItem
    })
    return id
  }
}

export function useUpdateTripItem(tripId: string) {
  const [, changeTripDoc] = useTripDoc(tripId)
  return (itemId: string, item: TripItem): void => {
    changeTripDoc((d) => {
      d.tripItems[itemId] = item
    })
  }
}

export function useDeleteTripItem(tripId: string) {
  const [, changeTripDoc] = useTripDoc(tripId)
  return (itemId: string): void => {
    changeTripDoc((d) => {
      delete d.tripItems[itemId]
    })
  }
}
