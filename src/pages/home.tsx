import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TimelineLayout } from '@/components/timeline'
import { timelineData } from '@/stubs/timelineElements'

export function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4'>
      <h1 className='text-4xl font-bold'>Reisenotiz</h1>
      <Button variant='default' onClick={() => setCount(count + 1)}>
        Click Me ({count})
      </Button>
      <TimelineLayout items={timelineData} size="md" animate={true} />
    </div>
  )
}
