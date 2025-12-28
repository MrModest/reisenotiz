import { createBrowserRouter } from "react-router"
import { AppLayout } from "@/components/layout/app-layout"
import { HomePage } from "@/pages/home"
import { TripsPage } from "@/pages/trips"
import { SettingsPage } from "@/pages/settings"
import { TripTimelinePage } from "@/pages/trip-timeline"
import { TripItemViewPage } from "@/pages/trip-item-view"
import { TripItemEditPage } from "@/pages/trip-item-edit"

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      {
        index: true,
        Component: HomePage
      },
      {
        path: "trips",
        Component: TripsPage,
      },
      {
        path: "trips/:tripId",
        Component: TripTimelinePage
      },
      {
        path: "trips/:tripId/items/:itemId",
        Component: TripItemViewPage
      },
      {
        path: "trips/:tripId/items/:itemId/edit",
        Component: TripItemEditPage
      },
      {
        path: "settings",
        Component: SettingsPage
      }
    ]
  },
])
