import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AirportSelector } from '@/components/ui/combobox/airport'
import { airportDictionary } from '@/services'
import type { Airport } from '@/types'

export function HomePage() {
  const [count, setCount] = useState(0)
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null)

  return (
    <div className='min-h-screen flex flex-col items-center p-4'>
      <Button variant='default' onClick={() => setCount(count + 1)}>
        Click Me ({count})
      </Button>
      <Separator className='my-4 w-full' orientation='horizontal' />
      <AirportSelector
        items={airportDictionary.getAllValues()}
        onSelect={(airport) => {
          console.log('Selected airport:', airport)
          setSelectedAirport(airport)
        }}
      />
      {selectedAirport && (
        <p className='mt-2 text-sm text-muted-foreground'>
          Selected: {selectedAirport.name} ({selectedAirport.code})
        </p>
      )}
    </div>
  )
}
