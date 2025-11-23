import { createBrowserRouter } from "react-router"
import { AppLayout } from "@/components/layout/app-layout"
import { HomePage } from "@/pages/home"
import { TripsPage } from "@/pages/trips"
import { SettingsPage } from "@/pages/settings"

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
        Component: TripsPage
      },
      {
        path: "settings",
        Component: SettingsPage
      }
    ]
  },
])
