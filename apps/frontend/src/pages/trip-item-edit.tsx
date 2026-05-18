import { Suspense } from 'react'
import { TripItemForm } from '@/components/trip-item'
import {
  useTrip,
  useTripItem,
  useTripExists,
  useTripItemExists,
  useUpdateTripItem,
} from '@/store'
import { useParams, useNavigate } from 'react-router'

export function TripItemEditPage() {
  const { tripId, itemId } = useParams<{ tripId: string; itemId: string }>()
  if (!tripId || !itemId) return <NotFound />
  return <TripItemEditTripGate tripId={tripId} itemId={itemId} />
}

function TripItemEditTripGate({ tripId, itemId }: { tripId: string; itemId: string }) {
  if (!useTripExists(tripId)) return <NotFound />
  return (
    <Suspense fallback={null}>
      <TripItemEditItemGate tripId={tripId} itemId={itemId} />
    </Suspense>
  )
}

function TripItemEditItemGate({ tripId, itemId }: { tripId: string; itemId: string }) {
  if (!useTripItemExists(tripId, itemId)) return <NotFound />
  return <TripItemEditContent tripId={tripId} itemId={itemId} />
}

function TripItemEditContent({ tripId, itemId }: { tripId: string; itemId: string }) {
  const navigate = useNavigate()
  const trip = useTrip(tripId)
  const tripItem = useTripItem(tripId, itemId)
  const updateTripItem = useUpdateTripItem(tripId)

  const handleSave = (updatedItem: typeof tripItem) => {
    updateTripItem(itemId, updatedItem)
    navigate(-1)
  }

  const handleCancel = () => navigate(-1)

  return <TripItemForm trip={trip} tripItem={tripItem} onSave={handleSave} onCancel={handleCancel} />
}

function NotFound() {
  return (
    <div className='p-4 text-center'>
      <p className='text-muted-foreground'>Trip item not found</p>
    </div>
  )
}
