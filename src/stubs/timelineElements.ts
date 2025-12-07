import type { TimelineElement } from '@/components/timeline'
import { Flight, getTimelineItems } from '@/types'
import { tripsItems } from './tripItems'

export const timelineData: TimelineElement[] = [
  ...getTimelineItems(tripsItems[0] as Flight),
]

timelineData.sort((a, b) =>
  a.datetime.instant.localeCompare(b.datetime.instant)
)
