import type { TimelineElement } from '@/components/timeline'
import {
  Flight,
  getFlightTimelineItems,
  Hotel,
  getHotelTimelineItems
} from '@/types'
import { tripsItems } from './tripItems'

export const timelineData: TimelineElement[] = [
  ...getFlightTimelineItems(tripsItems[0] as Flight),
  ...getFlightTimelineItems(tripsItems[1] as Flight),
  ...getHotelTimelineItems(tripsItems[2] as Hotel),
  {
    id: 'timeline-element-2',
    datetime: {
      instant: '2025-12-03T05:00:00Z',
      zone: 'Asia/Tokyo'
    },
    link: '/some/link',
    title: 'Lunch Break',
    description: 'Enjoy a nice meal at a local restaurant.',
    icon: 'calendar',
    status: 'completed',
    color: 'accent',
  }
]

timelineData.sort((a, b) =>
  a.datetime.instant.localeCompare(b.datetime.instant)
)
