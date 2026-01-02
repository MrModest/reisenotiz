import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Flight } from '@/types'
import { defaultsFromFlight, flightFormSchema, FlightFormSchema } from './edit/formSchema'
import { airportDictionary } from '@/services/dictionaries/dicts'
import { AddressNone } from '@/types/trip/address'
import { Field } from '@/components/ui/field'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import { ItemHeader } from '../item-header'
import { SeparatorWithLabel } from '@/components/ui/separator'
import { AirportSelector, AirportSuggestion } from './edit/airport-selector'
import { airports } from '@/stubs/airports'

interface FlightItemEditProps {
  flight: Flight
  onSave?: (flight: Flight) => void
  className?: string
}

export function FlightItemEdit({ flight, onSave, className }: FlightItemEditProps) {
  const [selectedAirport, setSelectedAirport] = useState<AirportSuggestion>()
  const navigate = useNavigate()

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

  const airportSuggestions: AirportSuggestion[] = airportDictionary.getAllValues()
    .map(a => ({
      code: a.code,
      name: a.name
    }))

  return (
    <form className={cn('md:min-w-[480px]', className)} onSubmit={form.handleSubmit(onSubmit)}>
      <Field orientation='horizontal' className='flex-row items-center justify-between'>
        <ItemHeader
          title='Edit Flight'
          icon='flight'
          buttons={[
            { icon: 'save', isSubmit: true },
            { icon: 'cancel', onClick: () => navigate(-1) }
          ]}
        />
      </Field>
      <SeparatorWithLabel label='Departure' className='mb-2' />
      <AirportSelector
        suggestions={airportSuggestions}
        selected={selectedAirport?.code || ''}
        onSelect={code => setSelectedAirport(airports.find(a => a.code === code)!)}
        onCreate={handleCreateAirport}
      />
    </form>
  )
}

function convert(data: FlightFormSchema): Flight {
  // Conversion logic from FlightFormSchema to Flight goes here
  return {} as Flight
}

function handleCreateAirport(newAirport: AirportSuggestion) {
  airportDictionary.add({
    code: newAirport.code,
    name: newAirport.name,
    address: AddressNone,
    tzone: 'UTC'
  })
}
