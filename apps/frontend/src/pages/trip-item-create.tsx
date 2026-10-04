import { Suspense, useState } from 'react'
import { getTripItemModule } from '@/components/trip-items/registry'
import type { TripItemModule } from '@/components/trip-items/module'
import { PageHeader } from '@/components/layout/page-header'
import { useTrip, useTripExists, useCreateTripItem } from '@/store'
import { TripItem } from '@/types'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { routes } from '@/lib/routes'

export function TripItemCreatePage() {
  const { tripId } = useParams<{ tripId: string }>()
  const [searchParams] = useSearchParams()
  const module = getTripItemModule(searchParams.get('type') ?? '')

  if (!tripId || !module) return <NotFound tripId={tripId} />
  return <TripItemCreateGate key={module.type} tripId={tripId} module={module} />
}

function TripItemCreateGate({ tripId, module }: { tripId: string; module: TripItemModule }) {
  if (!useTripExists(tripId)) return <NotFound />
  return (
    <Suspense fallback={<PageHeader title='' backTo={routes.trips.trip(tripId)} />}>
      <TripItemCreateContent tripId={tripId} module={module} />
    </Suspense>
  )
}

function TripItemCreateContent({ tripId, module }: { tripId: string; module: TripItemModule }) {
  const navigate = useNavigate()
  const trip = useTrip(tripId)
  const createTripItem = useCreateTripItem(tripId)

  const [draft] = useState(() => module.createDraft(tripId))

  const handleSave = (item: TripItem) => {
    createTripItem(item)
    navigate(-1)
  }

  const handleCancel = () => navigate(-1)

  return (
    <>
      <PageHeader title={trip.name} icon='trip' backTo={routes.trips.trip(tripId)} />
      <div className='min-h-0 flex-1 overflow-y-auto px-4'>
        <module.Form item={draft} onSubmit={handleSave} onCancel={handleCancel} />
      </div>
    </>
  )
}

function NotFound({ tripId }: { tripId?: string }) {
  return <PageHeader title='Not found' backTo={tripId ? routes.trips.trip(tripId) : routes.trips.list()} />
}
