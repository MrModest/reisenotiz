import { useDocument, useDocuments, useRepo } from '@automerge/react'
import type { Trip, TripItem, TripItemType } from '@/types'
import type { TripSummary } from '@/lib/trip'
import { buildTimelineDays, type TimelineDay } from '@/lib/timeline'
import { getTripItemModule } from '@/components/trip-items/registry'
import { generateUUID } from '@/types/common/uuid'
import { useRootDocUrl } from '@/contexts/root-doc-context'
import type { RootDoc, TripDoc } from './automerge/types'
import { withoutUndefined } from './automerge/without-undefined'

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

  return Array.from(tripDocs.values())
    .map((doc) => doc.trip)
    .sort((a, b) => b.startDate.instant.localeCompare(a.startDate.instant))
}

export function useTripSummaries(): TripSummary[] {
  const [rootDoc] = useRootDoc()
  const [tripDocs] = useDocuments<TripDoc>(Object.values(rootDoc.tripIndex), { suspense: true })

  return Array.from(tripDocs.values()).map((doc) => ({
    trip: doc.trip,
    itemCount: Object.keys(doc.tripItems).length,
  }))
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

export function useTimelineDays(tripId: string, filter?: TripItemType): TimelineDay[] {
  const tripItems = useTripItems(tripId)
  const elements = tripItems.flatMap((item) => getTripItemModule(item.type)?.toTimelineElements(item) ?? [])
  return buildTimelineDays(elements, filter)
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
  const repo = useRepo()
  const [rootDoc, changeRoot] = useRootDoc()
  return (id: string): void => {
    const url = rootDoc.tripIndex[id]
    changeRoot((d) => {
      delete d.tripIndex[id]
    })
    if (url) repo.delete(url)
  }
}

export function useCreateTripItem(tripId: string) {
  const [, changeTripDoc] = useTripDoc(tripId)
  return (item: Omit<TripItem, 'id'>): string => {
    const id = generateUUID()
    changeTripDoc((d) => {
      d.tripItems[id] = withoutUndefined({ ...item, id } as TripItem)
    })
    return id
  }
}

export function useUpdateTripItem(tripId: string) {
  const [, changeTripDoc] = useTripDoc(tripId)
  return (itemId: string, item: TripItem): void => {
    const next = withoutUndefined(item)
    changeTripDoc((d) => {
      const stored = d.tripItems[itemId]
      for (const key of Object.keys(stored)) {
        if (!(key in next)) delete stored[key as keyof TripItem]
      }
      Object.assign(stored, next)
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
