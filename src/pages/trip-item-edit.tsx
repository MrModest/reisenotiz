import { TripItemEdit } from "@/components/trip-item"
import { useTrip, useTripItem, useTripsStore } from "@/store"
import { UUID } from "@/types"
import { useParams, useNavigate } from "react-router"

export function TripItemEditPage() {
  const { tripId, itemId } = useParams<{ tripId: UUID; itemId: UUID }>()

  if (!tripId || !itemId) {
    return <NotFound />
  }

  return <TripItemEditContent tripId={tripId} itemId={itemId} />
}

function TripItemEditContent({ tripId, itemId }: { tripId: UUID; itemId: UUID }) {
  const navigate = useNavigate()
  const trip = useTrip(tripId)
  const tripItem = useTripItem(itemId)
  const updateTripItem = useTripsStore(state => state.updateTripItem)

  if (!trip || !tripItem) {
    return <NotFound />
  }

  const handleSave = (updatedItem: typeof tripItem) => {
    updateTripItem(itemId, updatedItem)
    navigate(-1)
  }

  return (
    <TripItemEdit trip={trip} tripItem={tripItem} onSave={handleSave} />
  )
}

function NotFound() {
  return (
    <div className="p-4 text-center">
      <p className="text-muted-foreground">Trip item not found</p>
    </div>
  )
}
