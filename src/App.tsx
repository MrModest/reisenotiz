import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TimelineLayout } from '@/components/timeline'
import { timelineData } from '@/stubs/timelineElements'
import { Link } from 'react-router'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <h1 className='text-4xl font-bold'>Reisenotiz</h1>
      <Button variant='default' onClick={() => setCount(count + 1)}>Click Me ({count})</Button>

      <Link to="/trips">Go to Trips Page</Link>

      <TimelineLayout items={timelineData} size="md" animate={true} />
    </div>
  )
}

export default App
