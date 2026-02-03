import { useParams } from 'react-router'
import { TimelineLayout } from '@/components/ui/timeline'
import { AddTripItemFab } from '@/components/trip-timeline'
import { useTrip, useTimelineElements } from '@/store'
import { useHeaderTitle, useHeaderBackButton } from '@/hooks/use-header-title'
import { UUID } from '@/types'

export function TripTimelinePage() {
  const { tripId } = useParams<{ tripId: UUID }>()

  if (!tripId) {
    return <NotFound />
  }

  return <TripTimelineContent tripId={tripId} />
}

function TripTimelineContent({ tripId }: { tripId: UUID }) {
  const trip = useTrip(tripId)
  const timelineElements = useTimelineElements(tripId)

  useHeaderTitle(trip?.name, 'timeline')
  useHeaderBackButton(true)

  if (!trip) {
    return <NotFound />
  }

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
