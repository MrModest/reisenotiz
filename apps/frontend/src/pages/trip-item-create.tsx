import { Suspense, useState } from 'react'
import { getTripItemModule, tripItemModules } from '@/components/trip-items/registry'
import type { TripItemModule } from '@/components/trip-items/module'
import { PageHeader } from '@/components/layout/page-header'
import { Icon } from '@/components/icon'
import { Item, ItemTitle } from '@/components/ui/item'
import { useTrip, useTripExists, useCreateTripItem } from '@/store'
import { TripItem } from '@/types'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router'
import { routes } from '@/lib/routes'

export function TripItemCreatePage() {
  const { tripId } = useParams<{ tripId: string }>()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const module = getTripItemModule(type ?? '')

  if (tripId && type === null) return <TypePicker tripId={tripId} />
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

// The create route with no type on it. A tile replaces it, so back and save return to the timeline.
function TypePicker({ tripId }: { tripId: string }) {
  return (
    <>
      <PageHeader title='Add item' backTo={routes.trips.trip(tripId)} />
      <div className='grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto p-4'>
        {tripItemModules.map((m) => (
          <Item
            key={m.type}
            variant='outline'
            render={<Link to={routes.trips.newItem(tripId, m.type)} replace />}
            className='min-h-24 flex-col items-start justify-between gap-4 rounded-xl bg-card p-4 hover:bg-accent/50'
          >
            <Icon name={m.icon} className='size-5 text-muted-foreground' />
            <ItemTitle className='text-[15px]'>{m.label}</ItemTitle>
          </Item>
        ))}
      </div>
    </>
  )
}

function NotFound({ tripId }: { tripId?: string }) {
  return <PageHeader title='Not found' backTo={tripId ? routes.trips.trip(tripId) : routes.trips.list()} />
}
