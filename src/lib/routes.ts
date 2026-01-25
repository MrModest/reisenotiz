import { TripItemType } from '@/types'

export const routes = {
  root: '/',
  settings: '/settings',
  trips: {
    list: () =>
      `/trips`,
    trip: (tripId: string) =>
      `/trips/${tripId}`,
    item: (tripId: string, itemId: string) =>
      `/trips/${tripId}/items/${itemId}`,
    newItem: (tripId: string, type: TripItemType) =>
      `/trips/${tripId}/items/new?type=${type}`,
    editItem: (tripId: string, itemId: string) =>
      `/trips/${tripId}/items/${itemId}/edit`,
  },
} as const
