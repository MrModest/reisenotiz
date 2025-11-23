import { useParams } from 'react-router'
import { TimelineLayout } from '@/components/timeline'
import { timelineData } from '@/stubs/timelineElements'
import { trips } from '@/stubs/trips'
import { useHeaderTitle } from '@/hooks/use-header-title'

export function TripTimelinePage() {
  const { tripId } = useParams()
  const trip = trips.find(t => t.id === tripId)

  useHeaderTitle(trip?.title)

  return (
    <TimelineLayout items={timelineData} size="md" animate={true} />
  )
}
