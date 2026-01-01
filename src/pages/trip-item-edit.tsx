import { TripItemEdit } from "@/components/trip-item"
import { tripsItems } from "@/stubs/tripItems"
import { trips } from "@/stubs/trips"
import { UUID } from "@/types"
import { useParams } from "react-router"

export function TripItemEditPage() {
  const { tripId, itemId } = useParams<{ tripId: UUID; itemId: UUID }>()

  const trip = trips.find(t => t.id === tripId)!
  const tripItem = tripsItems.find(item => item.id === itemId && item.tripId === tripId)!

  return (
    <TripItemEdit trip={trip} tripItem={tripItem} />
  )
}
