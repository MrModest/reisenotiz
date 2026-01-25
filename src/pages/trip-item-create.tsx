import { TripItemEdit } from "@/components/trip-item"
import { useTrip, useTripsStore } from "@/store"
import { TripItemType, UUID } from "@/types"
import { useParams, useNavigate, useSearchParams } from "react-router"
import { createDraftItem } from "@/lib/draft-items"

export function TripItemCreatePage() {
  const { tripId } = useParams<{ tripId: UUID }>()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') as TripItemType | null

  if (!tripId || !type) {
    return <NotFound />
  }

  return <TripItemCreateContent tripId={tripId} type={type} />
}

function TripItemCreateContent({ tripId, type }: { tripId: UUID; type: TripItemType }) {
  const navigate = useNavigate()
  const trip = useTrip(tripId)
  const createTripItem = useTripsStore(state => state.createTripItem)

  if (!trip) {
    return <NotFound />
  }

  const draftItem = createDraftItem(tripId, type)

  const handleSave = (item: typeof draftItem) => {
    createTripItem(item)
    navigate(-1)
  }

  return (
    <TripItemEdit
      trip={trip}
      tripItem={draftItem}
      onSave={handleSave}
    />
  )
}

function NotFound() {
  return (
    <div className='p-4 text-center'>
      <p className='text-muted-foreground'>Trip or item type not found</p>
    </div>
  )
}
