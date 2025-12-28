import { TripItemEdit } from "@/components/trip-item"
import { tripsItems } from "@/stubs/tripItems"
import { UUID } from "@/types"
import { useParams } from "react-router"

export function TripItemEditPage() {
  const { tripId, itemId } = useParams<{ tripId: UUID; itemId: UUID }>()

  const tripItem = tripsItems.find(item => item.id === itemId && item.tripId === tripId)!

  return (
    <TripItemEdit tripItem={tripItem} />
  )
}
