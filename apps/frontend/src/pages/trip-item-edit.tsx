import { Suspense } from 'react'
import { getTripItemModule } from '@/components/trip-items/registry'
import { PageHeader } from '@/components/layout/page-header'
import {
  useTrip,
  useTripItem,
  useTripExists,
  useTripItemExists,
  useUpdateTripItem,
} from '@/store'
import { useParams, useNavigate } from 'react-router'
import { routes } from '@/lib/routes'

export function TripItemEditPage() {
  const { tripId, itemId } = useParams<{ tripId: string; itemId: string }>()
  if (!tripId || !itemId) return <NotFound />
  return <TripItemEditTripGate tripId={tripId} itemId={itemId} />
}

function TripItemEditTripGate({ tripId, itemId }: { tripId: string; itemId: string }) {
  if (!useTripExists(tripId)) return <NotFound />
  return (
    <Suspense fallback={<PageHeader title='' backTo={routes.trips.item(tripId, itemId)} />}>
      <TripItemEditItemGate tripId={tripId} itemId={itemId} />
    </Suspense>
  )
}

function TripItemEditItemGate({ tripId, itemId }: { tripId: string; itemId: string }) {
  if (!useTripItemExists(tripId, itemId)) return <NotFound tripId={tripId} />
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
  const module = getTripItemModule(tripItem.type)

  return (
    <>
      <PageHeader title={trip.name} icon='trip' backTo={routes.trips.item(tripId, itemId)} />
      <div className='min-h-0 flex-1 overflow-y-auto px-4'>
        {module ? <module.Form item={tripItem} onSubmit={handleSave} onCancel={handleCancel} /> : <UnsupportedType />}
      </div>
    </>
  )
}

function NotFound({ tripId }: { tripId?: string }) {
  return <PageHeader title='Not found' backTo={tripId ? routes.trips.trip(tripId) : routes.trips.list()} />
}

function UnsupportedType() {
  return <p className='text-muted-foreground'>This app version cannot show this item type</p>
}
