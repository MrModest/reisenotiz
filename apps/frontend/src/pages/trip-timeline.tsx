import { Suspense } from 'react'
import { useParams } from 'react-router'
import { TimelineLayout } from '@/components/ui/timeline'
import { AddTripItemFab } from '@/components/trip-timeline'
import { PageHeader } from '@/components/layout/page-header'
import { SkeletonRows } from '@/components/ui/skeleton-rows'
import { useTrip, useTripExists, useTimelineElements } from '@/store'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { routes } from '@/lib/routes'

export function TripTimelinePage() {
  const { tripId } = useParams<{ tripId: string }>()
  if (!tripId) return <NotFound />
  return <TripTimelineGate tripId={tripId} />
}

function TripTimelineGate({ tripId }: { tripId: string }) {
  if (!useTripExists(tripId)) return <NotFound />
  // the title slot stays empty while the trip file loads; `Not found` is never the loading fallback
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title='' backTo={routes.trips.list()} />
          <div className='min-h-0 flex-1 overflow-y-auto p-4'>
            <SkeletonRows />
          </div>
        </>
      }
    >
      <TripTimelineContent tripId={tripId} />
    </Suspense>
  )
}

function TripTimelineContent({ tripId }: { tripId: string }) {
  const trip = useTrip(tripId)
  const timelineElements = useTimelineElements(tripId)
  useDocumentTitle(trip.name)

  return (
    <>
      <PageHeader title={trip.name} backTo={routes.trips.list()} />
      <div className='relative min-h-0 flex-1'>
        <div className='h-full overflow-y-auto p-4'>
          <TimelineLayout items={timelineElements} size='md' animate={true} />
        </div>
        <AddTripItemFab tripId={tripId} />
      </div>
    </>
  )
}

function NotFound() {
  return <PageHeader title='Not found' backTo={routes.trips.list()} />
}
