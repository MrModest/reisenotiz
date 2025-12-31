import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Flight } from '@/types'
import { defaultsFromFlight, flightFormSchema, FlightFormSchema } from './edit/formSchema'
import { AirportCombobox, AirportOption } from './edit/airport-combobox'
import { airportDictionary } from '@/services/dictionaries/dicts'
import { AddressNone } from '@/types/trip/address'
import { Field } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Title } from '@/components/ui/title'

interface FlightItemEditProps {
  flight: Flight
  onSave?: (flight: Flight) => void
  className?: string
}

export function FlightItemEdit({ flight, onSave, className }: FlightItemEditProps) {
  const [selectedAirport, setSelectedAirport] = useState<AirportOption | null>(null)

  const form = useForm<FlightFormSchema>({
    resolver: zodResolver(flightFormSchema),
    defaultValues: defaultsFromFlight(flight),
    mode: 'onTouched'
  })

  function onSubmit(data: FlightFormSchema) {
    console.log('formData', data)
    const updatedFlight = convert(data)
    console.log('updatedFlight', updatedFlight)
    onSave?.(updatedFlight)
  }

  const airports = airportDictionary.getAllValues()

  return (
    <form className={className} onSubmit={form.handleSubmit(onSubmit)}>
      <Field orientation="horizontal" className='flex-row-reverse my-2'>
        <Title className='py-2 pb-4' title='Flight Details' icon='flight' />
        <Button type="submit">Submit</Button>
        <Button variant="outline" type="button">Cancel</Button>
      </Field>
      <div>
        <AirportCombobox
          options={airports}
          value={selectedAirport}
          onSelect={setSelectedAirport}
          onCreate={handleCreateAirport}
        />
      </div>
    </form>
  )
}

function convert(data: FlightFormSchema): Flight {
  // Conversion logic from FlightFormSchema to Flight goes here
  return {} as Flight
}

function handleCreateAirport(newAirport: AirportOption) {
  airportDictionary.add({
    code: newAirport.code,
    name: newAirport.name,
    address: AddressNone,
    tzone: 'UTC'
  })
}
