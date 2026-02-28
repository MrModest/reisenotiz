import { TripItemView } from "@/components/trip-item"
import { useTrip, useTripItem } from "@/store"
import { useTripsStore } from "@/store/trips-store"
import { useParams, useNavigate } from "react-router"

export function TripItemViewPage() {
  const { tripId, itemId } = useParams<{ tripId: string; itemId: string }>()

  if (!tripId || !itemId) {
    return <NotFound />
  }

  return <TripItemViewContent tripId={tripId} itemId={itemId} />
}

function TripItemViewContent({ tripId, itemId }: { tripId: string; itemId: string }) {
  const trip = useTrip(tripId)
  const tripItem = useTripItem(itemId)
  const deleteTripItem = useTripsStore((state) => state.deleteTripItem)
  const navigate = useNavigate()

  if (!trip || !tripItem) {
    return <NotFound />
  }

  const handleDelete = () => {
    deleteTripItem(itemId)
    navigate(-1)
  }

  return (
    <TripItemView className='mb-10' trip={trip} tripItem={tripItem} onDelete={handleDelete} />
  )
}

function NotFound() {
  return (
    <div className="p-4 text-center">
      <p className="text-muted-foreground">Trip item not found</p>
    </div>
  )
}
