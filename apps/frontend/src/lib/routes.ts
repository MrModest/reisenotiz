import { TripItemType } from '@/types'

export const routes = {
  root: '/',
  settings: '/settings',
  trips: {
    list: () =>
      `/trips`,
    new: '/trips/new',
    trip: (tripId: string) =>
      `/trips/${tripId}`,
    edit: (tripId: string) =>
      `/trips/${tripId}/edit`,
    item: (tripId: string, itemId: string) =>
      `/trips/${tripId}/items/${itemId}`,
    newItem: (tripId: string, type: TripItemType) =>
      `/trips/${tripId}/items/new?type=${type}`,
    editItem: (tripId: string, itemId: string) =>
      `/trips/${tripId}/items/${itemId}/edit`,
  },
  records: {
    root: '/records',
    airports: '/records/airports',
    accommodations: '/records/accommodations',
  },
} as const
