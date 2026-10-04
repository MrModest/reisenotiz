import { Suspense, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { RouteErrorBoundary } from '@/components/route-error-boundary'
import { HomePage } from '@/pages/home'
import { TripsPage } from '@/pages/trips'
import { SettingsPage } from '@/pages/settings'
import { TripTimelinePage } from '@/pages/trip-timeline'
import { TripItemViewPage } from '@/pages/trip-item-view'
import { TripItemCreatePage } from '@/pages/trip-item-create'
import { TripItemEditPage } from '@/pages/trip-item-edit'
import { RecordsPage } from '@/pages/records'
import { AirportsRecordsPage } from '@/pages/records/airports'
import { AccommodationsRecordsPage } from '@/pages/records/accommodations'
import { routes } from '@/lib/routes'
import { airportDictionary, accommodationDictionary } from '@/services'

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
      await Promise.all([airportDictionary.load(), accommodationDictionary.load()])
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
        path: routes.trips.trip(':tripId'),
        ...withBoundaries(TripTimelinePage),
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
        path: routes.records.root,
        ...withBoundaries(RecordsPage),
      },
      {
        path: routes.records.airports,
        ...withBoundaries(AirportsRecordsPage),
      },
      {
        path: routes.records.accommodations,
        ...withBoundaries(AccommodationsRecordsPage),
      },
      {
        path: '*',
        element: <PageHeader title='Not found' />,
      },
    ],
  },
])
