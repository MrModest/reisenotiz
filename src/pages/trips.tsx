import { trips } from "@/stubs/trips"
import { Trips } from "@/components/trips"

export function TripsPage() {
  return (
    <Trips trips={trips} />
  )
}
