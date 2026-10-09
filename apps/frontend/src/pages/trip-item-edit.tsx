import { Suspense } from 'react'
import { getTripItemModule } from '@/components/trip-items/registry'
import { PageHeader } from '@/components/layout/page-header'
import {
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
  const tripItem = useTripItem(tripId, itemId)
  const updateTripItem = useUpdateTripItem(tripId)

  const handleSave = (updatedItem: typeof tripItem) => {
    updateTripItem(itemId, updatedItem)
    navigate(-1)
  }

  const handleCancel = () => navigate(-1)
  const module = getTripItemModule(tripItem.type)

  if (!module) {
    return (
      <>
        <PageHeader title='Unknown item' backTo={routes.trips.item(tripId, itemId)} />
        <p className='p-4 text-muted-foreground'>This app version cannot show this item type</p>
      </>
    )
  }

  return (
    <>
      <PageHeader title={`Edit ${module.label.toLowerCase()}`} icon={module.icon} backTo={routes.trips.item(tripId, itemId)} />
      <module.Form item={tripItem} onSubmit={handleSave} onCancel={handleCancel} />
    </>
  )
}

function NotFound({ tripId }: { tripId?: string }) {
  return <PageHeader title='Not found' backTo={tripId ? routes.trips.trip(tripId) : routes.trips.list()} />
}
