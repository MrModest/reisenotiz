import { Suspense, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { RouteErrorBoundary } from '@/components/route-error-boundary'
import { HomePage } from '@/pages/home'
import { TripsPage } from '@/pages/trips'
import { TripCreatePage } from '@/pages/trip-create'
import { TripEditPage } from '@/pages/trip-edit'
import { SettingsPage } from '@/pages/settings'
import { TripTimelinePage } from '@/pages/trip-timeline'
import { TripItemViewPage } from '@/pages/trip-item-view'
import { TripItemCreatePage } from '@/pages/trip-item-create'
import { TripItemEditPage } from '@/pages/trip-item-edit'
import { SavedPlacesPage, NewPlaceDialogRoute, EditPlaceDialogRoute } from '@/pages/saved-places'
import { routes } from '@/lib/routes'
import { airportDictionary, countryDictionary } from '@/services'

// One Suspense and one error boundary per route, inside the shell, so navigation survives both
function withBoundaries(Page: ComponentType) {
  return {
    ErrorBoundary: RouteErrorBoundary,
    element: (
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    ),
  }
}

export const router = createBrowserRouter([
  {
    path: routes.root,
    Component: AppShell,
    loader: async () => {
      // Countries load beside airports: a cached airport dictionary never fetches them
      await Promise.all([countryDictionary.load(), airportDictionary.load()])
      return null
    },
    children: [
      {
        index: true,
        ...withBoundaries(HomePage),
      },
      {
        path: routes.trips.list(),
        ...withBoundaries(TripsPage),
      },
      {
        path: routes.trips.new,
        ...withBoundaries(TripCreatePage),
      },
      {
        path: routes.trips.trip(':tripId'),
        ...withBoundaries(TripTimelinePage),
      },
      {
        path: routes.trips.edit(':tripId'),
        ...withBoundaries(TripEditPage),
      },
      {
        path: routes.trips.item(':tripId', ':itemId'),
        ...withBoundaries(TripItemViewPage),
      },
      {
        path: routes.trips.trip(':tripId') + '/items/new',
        ...withBoundaries(TripItemCreatePage),
      },
      {
        path: routes.trips.editItem(':tripId', ':itemId'),
        ...withBoundaries(TripItemEditPage),
      },
      {
        path: routes.settings,
        ...withBoundaries(SettingsPage),
      },
      {
        path: routes.savedPlaces.list,
        ...withBoundaries(SavedPlacesPage),
        // The dialog routes mount over the still-mounted list
        children: [
          { path: 'new', Component: NewPlaceDialogRoute },
          { path: ':placeKey/edit', Component: EditPlaceDialogRoute },
        ],
      },
      {
        path: '*',
        element: <PageHeader title='Not found' />,
      },
    ],
  },
])
