import { createBrowserRouter } from "react-router"
import App from "@/App"
import { TripsPage } from "@/pages/trips"

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App
  },
  {
    path: "/trips",
    Component: TripsPage
  },
])
