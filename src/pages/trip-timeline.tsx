import { useParams } from 'react-router'
import { TimelineLayout } from '@/components/timeline'
import { useTrip, useTimelineElements } from '@/store'
import { useHeaderTitle } from '@/hooks/use-header-title'
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

  if (!trip) {
    return <NotFound />
  }

  return (
    <TimelineLayout items={timelineElements} size='md' animate={true} />
  )
}

function NotFound() {
  return (
    <div className='p-4 text-center'>
      <p className='text-muted-foreground'>Trip not found</p>
    </div>
  )
}
