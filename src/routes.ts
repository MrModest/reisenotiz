import { createBrowserRouter } from "react-router"
import { AppLayout } from "@/components/layout/app-layout"
import { HomePage } from "@/pages/home"
import { TripsPage } from "@/pages/trips"
import { SettingsPage } from "@/pages/settings"
import { TripTimelinePage } from "@/pages/tripTimeline"

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
        path: "settings",
        Component: SettingsPage
      }
    ]
  },
])
