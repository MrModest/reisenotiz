import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { airports } from '@/stubs/airports'
import { Combobox, ComboboxOptions } from '@/components/ui/combo-box'
import { Separator } from '@/components/ui/separator'

export function HomePage() {
  const [count, setCount] = useState(0)

  const [airportOptions, setAirportOptions] = useState<ComboboxOptions[]>(
    airports.map((airport) => ({
      value: airport.code,
      label: airport.name
    }))
  )

  function addAirportOption(option: ComboboxOptions) {
    setAirportOptions((prevOptions) => [...prevOptions, option])
  }

  const [selectedAirport, setSelectedAirport] = useState<string | null>(null)

    function handleSelect(option: ComboboxOptions) {
      console.log('handleSelect')
      console.log(option)
      setSelectedAirport(option.value)
    }

    function handleAppendGroup(label: ComboboxOptions['label']) {
      const newAirport = {
        value: label.slice(0, 3).toUpperCase(),
        label: label
      }
      addAirportOption(newAirport)
      console.log('handleAppendGroup')
      console.log(newAirport)
      handleSelect(newAirport)
    }

  return (
    <div className='min-h-screen flex flex-col items-center p-4'>
      <Button variant='default' onClick={() => setCount(count + 1)}>
        Click Me ({count})
      </Button>
      <Separator className='my-4 w-full' orientation='horizontal' />
      <Combobox
        options={airportOptions}
        placeholder="Select airport"
        selected={selectedAirport ?? ''}
        onChange={handleSelect}
        onCreate={handleAppendGroup}
      />
    </div>
  )
}
