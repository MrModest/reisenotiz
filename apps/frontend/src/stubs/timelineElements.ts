import type { TimelineElement } from '@/components/ui/timeline'
import { Flight, getFlightTimelineItems, Accommodation, getHotelTimelineItems } from '@/types'
import { tripsItems } from './tripItems'
import { routes } from '@/lib/routes'

export const timelineData: TimelineElement[] = [
  ...getFlightTimelineItems(tripsItems[0] as Flight),
  ...getFlightTimelineItems(tripsItems[1] as Flight),
  ...getHotelTimelineItems(tripsItems[2] as Accommodation),
  {
    id: 'timeline-element-2',
    datetime: {
      instant: '2025-12-03T05:00:00Z',
      zone: 'Asia/Tokyo',
    },
    link: routes.trips.item('trip-1', 'item-2'),
    title: 'Lunch Break',
    description: 'Enjoy a nice meal at a local restaurant.',
    icon: 'calendar',
    status: 'inactive',
  },
]

timelineData.sort((a, b) => a.datetime.instant.localeCompare(b.datetime.instant))
