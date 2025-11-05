import { Button } from '@/components/ui/button'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <h1 className='text-4xl font-bold'>Reisenotiz</h1>
      <Button variant='default' onClick={() => setCount(count + 1)}>Click Me ({count})</Button>
    </div>
  )
}

export default App
