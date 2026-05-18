import { Suspense } from 'react'
import { useParams } from 'react-router'
import { TimelineLayout } from '@/components/ui/timeline'
import { AddTripItemFab } from '@/components/trip-timeline'
import { useTrip, useTripExists, useTimelineElements } from '@/store'
import { useHeaderTitle, useHeaderBackButton } from '@/hooks/use-header-title'

export function TripTimelinePage() {
  const { tripId } = useParams<{ tripId: string }>()
  useHeaderBackButton(true)

  if (!tripId) return <NotFound />
  return <TripTimelineGate tripId={tripId} />
}

function TripTimelineGate({ tripId }: { tripId: string }) {
  if (!useTripExists(tripId)) return <NotFound />
  return (
    <Suspense fallback={null}>
      <TripTimelineContent tripId={tripId} />
    </Suspense>
  )
}

function TripTimelineContent({ tripId }: { tripId: string }) {
  const trip = useTrip(tripId)
  const timelineElements = useTimelineElements(tripId)
  useHeaderTitle(trip.name, 'timeline')

  return (
    <>
      <TimelineLayout items={timelineElements} size='md' animate={true} />
      <AddTripItemFab tripId={tripId} />
    </>
  )
}

function NotFound() {
  return (
    <div className='p-4 text-center'>
      <p className='text-muted-foreground'>Trip not found</p>
    </div>
  )
}
