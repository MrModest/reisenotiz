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
    <Suspense fallback={<TripTimelineSkeleton />}>
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

function TripTimelineSkeleton() {
  return (
    <div className='w-full flex flex-col gap-3 p-4' role='status' aria-busy='true' aria-label='Loading trip timeline'>
      <span className='sr-only'>Loading trip timeline…</span>
      {[0, 1, 2].map((row) => (
        <div key={row} className='flex flex-row gap-3'>
          <div className='bg-muted size-8 shrink-0 animate-pulse rounded-full motion-reduce:animate-none' />
          <div className='flex flex-1 flex-col gap-2'>
            <div className='bg-muted h-4 w-1/3 animate-pulse rounded-xs motion-reduce:animate-none' />
            <div className='bg-muted h-3 w-2/3 animate-pulse rounded-xs motion-reduce:animate-none' />
          </div>
        </div>
      ))}
    </div>
  )
}

function NotFound() {
  return (
    <div className='p-4 text-center'>
      <p className='text-muted-foreground'>Trip not found</p>
    </div>
  )
}
