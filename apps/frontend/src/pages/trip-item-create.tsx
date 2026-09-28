import { Suspense } from 'react'
import { TripItemForm } from '@/components/trip-item'
import { PageHeader } from '@/components/layout/page-header'
import { useTrip, useTripExists, useCreateTripItem } from '@/store'
import { TripItem, TripItemType } from '@/types'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { createDraftItem } from '@/lib/draft-items'
import { routes } from '@/lib/routes'

export function TripItemCreatePage() {
  const { tripId } = useParams<{ tripId: string }>()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') as TripItemType | null

  if (!tripId || !type) return <NotFound tripId={tripId} />
  return <TripItemCreateGate tripId={tripId} type={type} />
}

function TripItemCreateGate({ tripId, type }: { tripId: string; type: TripItemType }) {
  if (!useTripExists(tripId)) return <NotFound />
  return (
    <Suspense fallback={<PageHeader title='' backTo={routes.trips.trip(tripId)} />}>
      <TripItemCreateContent tripId={tripId} type={type} />
    </Suspense>
  )
}

function TripItemCreateContent({ tripId, type }: { tripId: string; type: TripItemType }) {
  const navigate = useNavigate()
  const trip = useTrip(tripId)
  const createTripItem = useCreateTripItem(tripId)

  const draftItem = createDraftItem(tripId, type)

  const handleSave = (item: TripItem) => {
    createTripItem(item)
    navigate(-1)
  }

  const handleCancel = () => navigate(-1)

  return (
    <>
      <PageHeader title={trip.name} icon='trip' backTo={routes.trips.trip(tripId)} />
      <div className='min-h-0 flex-1 overflow-y-auto px-4'>
        <TripItemForm tripItem={draftItem} onSave={handleSave} onCancel={handleCancel} isCreate />
      </div>
    </>
  )
}

function NotFound({ tripId }: { tripId?: string }) {
  return <PageHeader title='Not found' backTo={tripId ? routes.trips.trip(tripId) : routes.trips.list()} />
}
