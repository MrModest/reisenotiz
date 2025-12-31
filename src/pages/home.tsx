import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AirportCombobox, AirportOption } from '@/components/trip-item/flight/edit/airport-combobox'
import { airportDictionary } from '@/services'
import { AddressNone } from '@/types/trip/address'

export function HomePage() {
  const [count, setCount] = useState(0)
  const [selectedAirport, setSelectedAirport] = useState<AirportOption | null>(null)

  return (
    <div className='min-h-screen flex flex-col items-center p-4'>
      <Button variant='default' onClick={() => setCount(count + 1)}>
        Click Me ({count})
      </Button>
      <Separator className='my-4 w-full' orientation='horizontal' />
      <AirportCombobox
        options={airportDictionary.getAllValues().map((airport) => ({
          code: airport.code,
          name: airport.name
        }))}
        value={selectedAirport}
        onSelect={setSelectedAirport}
        onCreate={handleCreateAirport}
      />
    </div>
  )
}

function handleCreateAirport(newAirport: AirportOption) {
  airportDictionary.add({
    code: newAirport.code,
    name: newAirport.name,
    address: AddressNone,
    tzone: 'UTC'
  })
}
