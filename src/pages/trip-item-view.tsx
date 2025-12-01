import { TripItemView } from "@/components/trip-item-view"
import { tripsItems } from "@/stubs/tripItems"
import { UUID } from "@/types"
import { useParams } from "react-router"

export function TripItemViewPage() {
  const { tripId, itemId } = useParams<{ tripId: UUID; itemId: UUID }>()

  const tripItem = tripsItems.find(item => item.id === itemId && item.tripId === tripId)

  return (
    <TripItemView tripItem={tripsItems[0]} className="mt-2" />
  )
}
