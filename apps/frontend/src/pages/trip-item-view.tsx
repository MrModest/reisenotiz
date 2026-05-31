import { Suspense } from 'react'
import { TripItemView } from '@/components/trip-item'
import { Loader } from '@/components/ui/loader'
import {
  useTrip,
  useTripItem,
  useTripExists,
  useTripItemExists,
  useDeleteTripItem,
} from '@/store'
import { useParams, useNavigate } from 'react-router'

export function TripItemViewPage() {
  const { tripId, itemId } = useParams<{ tripId: string; itemId: string }>()
  if (!tripId || !itemId) return <NotFound />
  return <TripItemViewTripGate tripId={tripId} itemId={itemId} />
}

function TripItemViewTripGate({ tripId, itemId }: { tripId: string; itemId: string }) {
  if (!useTripExists(tripId)) return <NotFound />
  return (
    <Suspense fallback={<Loader />}>
      <TripItemViewItemGate tripId={tripId} itemId={itemId} />
    </Suspense>
  )
}

function TripItemViewItemGate({ tripId, itemId }: { tripId: string; itemId: string }) {
  if (!useTripItemExists(tripId, itemId)) return <NotFound />
  return <TripItemViewContent tripId={tripId} itemId={itemId} />
}

function TripItemViewContent({ tripId, itemId }: { tripId: string; itemId: string }) {
  const trip = useTrip(tripId)
  const tripItem = useTripItem(tripId, itemId)
  const deleteTripItem = useDeleteTripItem(tripId)
  const navigate = useNavigate()

  const handleDelete = () => {
    deleteTripItem(itemId)
    navigate(-1)
  }

  return <TripItemView className='mb-10' trip={trip} tripItem={tripItem} onDelete={handleDelete} />
}

function NotFound() {
  return (
    <div className='p-4 text-center'>
      <p className='text-muted-foreground'>Trip item not found</p>
    </div>
  )
}
