import { useState } from 'react'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Airport, Flight, UUID } from '@/types'
import { defaultsFromFlight, flightFormSchema, FlightFormSchema } from './edit/formSchema'
import { Field, FieldSet } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { ItemHeader } from '../item-header'
import { Separator } from '@/components/ui/separator'
import { FieldInput } from '../field-input'
import { FieldTextarea } from '../field-textarea'
import { FieldPassengers } from '../field-passengers'
import { FieldAttachments } from '../field-attachments'
import { FieldDatePicker } from '../field-date-picker'
import { FieldTimePicker } from '../field-time-picker'
import { DateTime, ZonedInstant, formatTo } from '@/lib/datetime'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icon'
import { CollapsibleSection } from '../collapsible-section'
import { getCountryFlag } from '@/lib/utils/country-flag'
import { AirportSelector } from '@/components/ui/combobox/airport'
import { useAirports } from '@/hooks/use-airports'
import { AirportRecordDialog } from '@/components/records/airport-record-dialog'

function AirportPreview({ direction }: { direction: 'departure' | 'arrival' }) {
  const airport: Airport = useWatch({ name: `${direction}.airport` })
  const date: string = useWatch({ name: `${direction}.date` })
  const time: string = useWatch({ name: `${direction}.time` })

  if (!airport?.code) {
    return <span className='text-muted-foreground text-sm'>No {direction} info</span>
  }

  const flag = airport.address?.country ? getCountryFlag(airport.address.country) : '🌐'
  const airportDisplay = airport.name
    ? `${airport.name} (${airport.code})`
    : airport.code

  const zonedInstant = convertTime(date, time, airport.tzone)

  return (
    <div className='flex items-start gap-2 text-sm'>
      <span className='text-xl'>{flag}</span>
      <div>
        <div className='font-medium'>{airportDisplay}</div>
        <div className='text-muted-foreground'>
          {formatTo.date(zonedInstant)} · {formatTo.time(zonedInstant)} · {airport.tzone}
        </div>
      </div>
    </div>
  )
}

function NoteSection({ children }: { children: React.ReactNode }) {
  const note = useWatch({ name: 'note' })

  const preview = note && note.trim() !== '' ? (() => {
    const firstLine = note.split('\n')[0]
    const truncated = firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine
    return <span className='text-sm text-foreground'>{truncated}</span>
  })() : undefined

  return (
    <CollapsibleSection
      label='Note'
      preview={preview}
      defaultOpen={false}
      className='my-4'
    >
      {children}
    </CollapsibleSection>
  )
}

function PassengersSection({ children }: { children: React.ReactNode }) {
  const passengers = useWatch({ name: 'passengers' })
  const count = passengers?.length || 0
  const label = count > 0 ? `Passengers (${count})` : 'Passengers'

  return (
    <CollapsibleSection
      label={label}
      defaultOpen={false}
      className='mb-2 mt-6'
    >
      {children}
    </CollapsibleSection>
  )
}

function AttachmentsSection({ children }: { children: React.ReactNode }) {
  const attachments = useWatch({ name: 'attachments' })
  const count = attachments?.length || 0
  const label = count > 0 ? `Attachments (${count})` : 'Attachments'

  return (
    <CollapsibleSection
      label={label}
      defaultOpen={false}
      className='mb-2 mt-6'
    >
      {children}
    </CollapsibleSection>
  )
}

interface FlightItemFormProps {
  flight: Flight
  onSubmit: (flight: Flight) => void
  onCancel: () => void
  title?: string
  className?: string
}

export function FlightItemForm({ flight, onSubmit, onCancel, title, className }: FlightItemFormProps) {
  const form = useForm<FlightFormSchema>({
    resolver: zodResolver(flightFormSchema),
    defaultValues: defaultsFromFlight(flight),
    mode: 'onTouched'
  })

  function handleSubmit(data: FlightFormSchema) {
    console.log('formData', data)
    const updatedFlight = convert(data, flight.tripId, flight.id)
    console.log('updatedFlight', updatedFlight)
    onSubmit(updatedFlight)
  }

  return (
    <FormProvider {...form}>
      <form className={cn('w-default mb-10', className)} onSubmit={form.handleSubmit(handleSubmit)}>
        <Field orientation='horizontal' className='flex-row items-center justify-between'>
          <ItemHeader
            title={title || 'Flight'}
            icon='flight'
            buttons={[
              { icon: 'save', isSubmit: true },
              { icon: 'cancel', onClick: onCancel }
            ]}
          />
        </Field>
        <FieldSet className='flex-row gap-2 mt-4'>
          <FieldInput name='flightNumber' label='Flight Number' />
          <FieldInput name='carrier' label='Airline' />
        </FieldSet>
        <CollapsibleSection
          label='Departure'
          icon='flight-departure'
          preview={<AirportPreview direction='departure' />}
          defaultOpen={false}
          className='mb-2 mt-6'
        >
          <AirportPoint direction='departure' />
        </CollapsibleSection>
        <CollapsibleSection
          label='Arrival'
          icon='flight-arrival'
          preview={<AirportPreview direction='arrival' />}
          defaultOpen={false}
          className='mb-2 mt-6'
        >
          <AirportPoint direction='arrival' />
        </CollapsibleSection>
        <Separator className='my-4' />
        <FieldSet className='flex-row gap-2'>
          <FieldInput name='bookingCode' label='Booking' />
          <FieldInput name='seat' label='Seat(s)' />
        </FieldSet>
        <NoteSection>
          <FieldTextarea name='note' label='' placeholder='Add any notes about this flight...' />
        </NoteSection>
        <PassengersSection>
          <FieldPassengers name='passengers' />
        </PassengersSection>
        <AttachmentsSection>
          <FieldAttachments name='attachments' tripItemId={flight.id} />
        </AttachmentsSection>
        <Separator className='mt-4 mb-6' />
        <Field>
          <Button type='submit' variant='default'>Save</Button>
          <Button type='button' onClick={onCancel} variant='secondary'>Cancel</Button>
        </Field>
      </form>
    </FormProvider>
  )
}

function AirportPoint({ direction }: { direction: 'departure' | 'arrival' }) {
  const airports = useAirports()
  const { setValue, getValues } = useFormContext<FlightFormSchema>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const initialAirport = getValues(`${direction}.airport`)
  const [selected, setSelected] = useState<Airport | null>(() =>
    initialAirport?.code ? initialAirport as Airport : null
  )

  function handleAirportSelect(airport: Airport | null) {
    setSelected(airport)
    if (!airport) {
      setValue(`${direction}.airport`, { code: '', name: '', tzone: 'Etc/Utc' })
      return
    }
    setValue(`${direction}.airport`, airport)
  }

  return (
    <>
      <FieldSet className='flex-row items-end gap-2 my-2'>
        <div className='flex-1'>
          <AirportSelector
            items={airports}
            selected={selected}
            onSelect={handleAirportSelect}
          />
        </div>
        <Button
          type='button'
          variant='outline'
          onClick={() => setDialogOpen(true)}
        >
          <Icon name={selected ? 'edit' : 'add'} />
          {selected ? 'Edit' : 'Add New'}
        </Button>
      </FieldSet>
      <AirportPreview direction={direction} />
      <FieldSet className='grid grid-cols-2 md:flex md:flex-row items-end gap-2 mt-4'>
        <FieldDatePicker className='md:w-32' required name={`${direction}.date`} label='Date' />
        <FieldTimePicker className='md:w-20' required name={`${direction}.time`} label='Time' />
        <Separator className='mx-auto hidden md:block invisible' orientation='vertical' />
        <FieldInput className='md:w-15' name={`${direction}.terminal`} label='Terminal' />
        <FieldInput className='md:w-15' name={`${direction}.gate`} label='Gate' />
      </FieldSet>
      <AirportRecordDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        airport={selected}
        onSave={handleAirportSelect}
      />
    </>
  )
}

function convertTime(date: string, time: string, tz: string): ZonedInstant {
  const [year, month, day] = date.split('-').map(s => parseInt(s))
  const [hour, minute] = time.split(':').map(s => parseInt(s))

  return DateTime.fromObject({
    year, month, day,
    hour, minute
  }, tz).toZonedInstant()
}

function convert(data: FlightFormSchema, tripId: UUID, flightId: UUID): Flight {
  return {
    type: 'Flight',
    id: flightId,
    tripId: tripId,
    note: data.note || '',
    passengers: data.passengers || [],
    attachments: data.attachments || [],
    flightNumber: data.flightNumber,
    carrier: data.carrier,
    departure: {
      airport: data.departure.airport,
      time: convertTime(data.departure.date, data.departure.time, data.departure.airport.tzone),
      terminal: data.departure.terminal,
      gate: data.departure.gate,
    },
    arrival: {
      airport: data.arrival.airport,
      time: convertTime(data.arrival.date, data.arrival.time, data.arrival.airport.tzone),
      terminal: data.arrival.terminal,
      gate: data.arrival.gate,
    },
    bookingCode: data.bookingCode,
    seat: data.seat,
  } as Flight
}
