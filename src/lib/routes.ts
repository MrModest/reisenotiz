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
    editItem: (tripId: string, itemId: string) =>
      `/trips/${tripId}/items/${itemId}/edit`,
  },
} as const
