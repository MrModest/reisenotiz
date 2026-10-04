import { Suspense } from 'react'
import { TripItemView } from '@/components/trip-item'
import { PageHeader } from '@/components/layout/page-header'
import {
  useTrip,
  useTripItem,
  useTripExists,
  useTripItemExists,
  useDeleteTripItem,
} from '@/store'
import { useParams, useNavigate } from 'react-router'
import { routes } from '@/lib/routes'

export function TripItemViewPage() {
  const { tripId, itemId } = useParams<{ tripId: string; itemId: string }>()
  if (!tripId || !itemId) return <NotFound />
  return <TripItemViewTripGate tripId={tripId} itemId={itemId} />
}

function TripItemViewTripGate({ tripId, itemId }: { tripId: string; itemId: string }) {
  if (!useTripExists(tripId)) return <NotFound />
  return (
    <Suspense fallback={<PageHeader title='' backTo={routes.trips.trip(tripId)} />}>
      <TripItemViewItemGate tripId={tripId} itemId={itemId} />
    </Suspense>
  )
}

function TripItemViewItemGate({ tripId, itemId }: { tripId: string; itemId: string }) {
  if (!useTripItemExists(tripId, itemId)) return <NotFound tripId={tripId} />
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

  return (
    <>
      <PageHeader title={trip.name} icon='trip' backTo={routes.trips.trip(tripId)} />
      <div className='min-h-0 flex-1 overflow-y-auto px-4'>
        <TripItemView className='mb-10' tripItem={tripItem} onDelete={handleDelete} />
      </div>
    </>
  )
}

function NotFound({ tripId }: { tripId?: string }) {
  return <PageHeader title='Not found' backTo={tripId ? routes.trips.trip(tripId) : routes.trips.list()} />
}
