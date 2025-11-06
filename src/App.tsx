import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { TimelineLayout } from '@/components/timeline'

import type { TimelineElement } from '@/components/timeline'
import { Icon } from './components/icon/icon'

const timelineData: TimelineElement[] = [
  {
    id: 1,
    title: 'First event',
    date: '2022-01-01',
    icon: <Icon name='calendar' />,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Odio euismod lacinia at quis risus sed vulputate odio ut. Quam viverra orci sagittis eu volutpat odio facilisis mauris.',
    status: 'completed',
  },
  {
    id: 2,
    title: 'Second event',
    date: '2022-02-01',
    icon: <Icon name='calendar'/>,
    description:
      'Aut eius excepturi ex recusandae eius est minima molestiae. Nam dolores iusto ad fugit reprehenderit hic dolorem quisquam et quia omnis non suscipit nihil sit.',
    status: 'in-progress',
  },
  {
    id: 3,
    title: 'Third event',
    date: '2022-03-01',
    icon: <Icon name='calendar' />,
    description:
      'Sit culpa quas ex nulla animi qui deleniti minus rem placeat mollitia. Et enim doloremque et quia sequi ea dolores voluptatem ea rerum vitae.',
    status: 'pending',
  },
]

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <h1 className='text-4xl font-bold'>Reisenotiz</h1>
      <Button variant='default' onClick={() => setCount(count + 1)}>Click Me ({count})</Button>
      <TimelineLayout items={timelineData} size="md" animate={true} />
    </div>
  )
}

export default App
