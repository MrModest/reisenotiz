import { TripItemView } from "@/components/trip-item"
import { useTrip, useTripItem } from "@/store"
import { UUID } from "@/types"
import { useParams } from "react-router"

export function TripItemViewPage() {
  const { tripId, itemId } = useParams<{ tripId: UUID; itemId: UUID }>()

  if (!tripId || !itemId) {
    return <NotFound />
  }

  return <TripItemViewContent tripId={tripId} itemId={itemId} />
}

function TripItemViewContent({ tripId, itemId }: { tripId: UUID; itemId: UUID }) {
  const trip = useTrip(tripId)
  const tripItem = useTripItem(itemId)

  if (!trip || !tripItem) {
    return <NotFound />
  }

  return (
    <TripItemView trip={trip} tripItem={tripItem} />
  )
}

function NotFound() {
  return (
    <div className="p-4 text-center">
      <p className="text-muted-foreground">Trip item not found</p>
    </div>
  )
}
