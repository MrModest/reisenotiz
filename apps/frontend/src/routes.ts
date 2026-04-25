import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/app-layout'
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

export const router = createBrowserRouter([
  {
    path: routes.root,
    Component: AppLayout,
    loader: async () => {
      await Promise.all([airportDictionary.load(), accommodationDictionary.load()])
      return null
    },
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: routes.trips.list(),
        Component: TripsPage,
      },
      {
        path: routes.trips.trip(':tripId'),
        Component: TripTimelinePage,
      },
      {
        path: routes.trips.item(':tripId', ':itemId'),
        Component: TripItemViewPage,
      },
      {
        path: routes.trips.trip(':tripId') + '/items/new',
        Component: TripItemCreatePage,
      },
      {
        path: routes.trips.editItem(':tripId', ':itemId'),
        Component: TripItemEditPage,
      },
      {
        path: routes.settings,
        Component: SettingsPage,
      },
      {
        path: routes.records.root,
        Component: RecordsPage,
      },
      {
        path: routes.records.airports,
        Component: AirportsRecordsPage,
      },
      {
        path: routes.records.accommodations,
        Component: AccommodationsRecordsPage,
      },
    ],
  },
])
