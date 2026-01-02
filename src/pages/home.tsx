import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { airportDictionary } from '@/services'
import { AddressNone } from '@/types/trip/address'

export function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <div className='min-h-screen flex flex-col items-center p-4'>
      <Button variant='default' onClick={() => setCount(count + 1)}>
        Click Me ({count})
      </Button>
      <Separator className='my-4 w-full' orientation='horizontal' />
    </div>
  )
}
