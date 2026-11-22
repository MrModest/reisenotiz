import { useDocument, useDocuments, useRepo } from '@automerge/react'
import type { Trip, TripItem } from '@/types'
import type { TripSummary } from '@/lib/trip'
import { generateUUID } from '@/types/common/uuid'
import { useRootDocUrl } from '@/contexts/root-doc-context'
import type { RootDoc, TripDoc } from './automerge/types'
import { withoutUndefined } from './automerge/without-undefined'
import { overwrite } from './automerge/overwrite'
import { assertValidTripItem } from './invariants'
import { placesOf, saveCustomPlaces } from './saved-places'

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

// Writing an item also saves its custom places as templates, in the root document
export function useCreateTripItem(tripId: string) {
  const [, changeTripDoc] = useTripDoc(tripId)
  const [, changeRoot] = useRootDoc()
  return (item: Omit<TripItem, 'id'>): string => {
    assertValidTripItem(item)
    const id = generateUUID()
    changeTripDoc((d) => {
      d.tripItems[id] = withoutUndefined({ ...item, id } as TripItem)
    })
    changeRoot((d) => saveCustomPlaces(d, placesOf(item)))
    return id
  }
}

export function useUpdateTripItem(tripId: string) {
  const [, changeTripDoc] = useTripDoc(tripId)
  const [, changeRoot] = useRootDoc()
  return (itemId: string, item: TripItem): void => {
    assertValidTripItem(item)
    changeTripDoc((d) => overwrite(d.tripItems, itemId, item))
    changeRoot((d) => saveCustomPlaces(d, placesOf(item)))
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
