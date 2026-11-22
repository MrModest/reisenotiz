import type { PlaceType, TripItemType } from '@/types'

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
    // generic so `item(':tripId', ':itemId')` is a literal pattern `useMatch` can type
    item: <T extends string, I extends string>(tripId: T, itemId: I) =>
      `/trips/${tripId}/items/${itemId}` as const,
    // without a type: the type picker
    newItem: (tripId: string, type?: TripItemType) =>
      `/trips/${tripId}/items/new${type ? `?type=${type}` : ''}`,
    editItem: (tripId: string, itemId: string) =>
      `/trips/${tripId}/items/${itemId}/edit`,
  },
  savedPlaces: {
    list: '/saved-places',
    new: (type: PlaceType) =>
      `/saved-places/new?type=${type}`,
    // A place id holds a colon (`custom:…`)
    edit: (placeId: string) =>
      `/saved-places/${encodeURIComponent(placeId)}/edit`,
  },
} as const
