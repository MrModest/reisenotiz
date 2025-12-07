import type { TimelineElement } from '@/components/timeline'
import { Icon } from '@/components/icon/icon'
import { Flight, getTimelineItems } from '@/types'
import { tripsItems } from './tripItems'

export const timelineData: TimelineElement[] = [
  ...getTimelineItems(tripsItems[0] as Flight).map(item => ({
    ...item,
    icon: <Icon name={item.icon as string} />
  })),
  {
    id: "1",
    link: '/trips/1/items/1',
    title: 'First event',
    datetime: { instant: '2022-01-01T10:00:00Z', zone: 'UTC' },
    icon: <Icon name='calendar' />,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Odio euismod lacinia at quis risus sed vulputate odio ut. Quam viverra orci sagittis eu volutpat odio facilisis mauris.',
    status: 'completed',
  },
  {
    id: "2",
    link: '/trips/1/items/2',
    title: 'Second event',
    datetime: { instant: '2022-02-01T14:30:00Z', zone: 'UTC' },
    icon: <Icon name='calendar'/>,
    description:
      'Aut eius excepturi ex recusandae eius est minima molestiae. Nam dolores iusto ad fugit reprehenderit hic dolorem quisquam et quia omnis non suscipit nihil sit.',
    status: 'in-progress',
  },
  {
    id: "3",
    link: '/trips/1/items/3',
    title: 'Third event',
    datetime: { instant: '2022-03-01T09:15:00Z', zone: 'UTC' },
    icon: <Icon name='calendar' />,
    description:
      'Sit culpa quas ex nulla animi qui deleniti minus rem placeat mollitia. Et enim doloremque et quia sequi ea dolores voluptatem ea rerum vitae.',
    status: 'pending',
  },
]
