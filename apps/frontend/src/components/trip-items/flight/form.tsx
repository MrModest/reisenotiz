import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field } from '@/components/ui/field'
import { useFormField } from '@/hooks/use-form-field'
import { useSavedPlaces } from '@/store'
import type { Flight } from '@/types'
import type { TripItemFormProps } from '../module'
import { DateTimeField } from '../shared/date-time-field'
import { FieldAttachments } from '../shared/field-attachments'
import { FieldInput } from '../shared/field-input'
import { FieldLabel, SectionLabel } from '../shared/field-label'
import { FieldTextarea } from '../shared/field-textarea'
import { FormActions } from '../shared/form-actions'
import { PersonChips } from '../shared/person-chips'
import { PlacePicker } from '../shared/place-picker'
import { flightFormSchema, flightFormValues, flightFromFormValues, type FlightFormValues } from './schema'

export function FlightForm({ item: flight, onSubmit, onCancel }: TripItemFormProps<Flight>) {
  const places = useSavedPlaces()
  const form = useForm<FlightFormValues>({
    resolver: zodResolver(flightFormSchema),
    defaultValues: flightFormValues(flight),
    mode: 'onTouched',
  })

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(flightFromFormValues(values, flight, places)))}
        className='flex min-h-0 flex-1 flex-col'
      >
        <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4'>
          <div className='grid grid-cols-2 gap-3'>
            <FieldInput name='flightNumber' label='Flight number' />
            <FieldInput name='carrier' label='Carrier' />
          </div>
          <FlightPointGroup point='departure' label='Departure' />
          <FlightPointGroup point='arrival' label='Arrival' />
          <div className='grid grid-cols-2 gap-3 pt-3'>
            <FieldInput name='bookingCode' label='Booking code' />
            <FieldInput name='seat' label='Seat' />
          </div>
          <PassengersField />
          <FieldTextarea name='note' label='Notes' />
          <Field className='gap-1.5'>
            <SectionLabel>Attachments</SectionLabel>
            <FieldAttachments name='attachments' />
          </Field>
        </div>
        <FormActions onCancel={onCancel} />
      </form>
    </FormProvider>
  )
}

function FlightPointGroup({ point, label }: { point: 'departure' | 'arrival'; label: string }) {
  return (
    <section aria-label={label} className='flex flex-col gap-3 pt-3'>
      <h3 className='border-b border-border pb-2 font-mono text-[10px] tracking-[.08em] uppercase'>{label}</h3>
      <PlacePicker type='Airport' name={`${point}.placeKey`} label='Airport' />
      <DateTimeField dateName={`${point}.date`} timeName={`${point}.time`} />
      <div className='grid grid-cols-2 gap-3'>
        <FieldInput name={`${point}.terminal`} label='Terminal' />
        <FieldInput name={`${point}.gate`} label='Gate' />
      </div>
    </section>
  )
}

function PassengersField() {
  const { field } = useFormField('passengers')

  return (
    <Field className='gap-1.5'>
      <FieldLabel htmlFor='passengers'>Passengers</FieldLabel>
      <PersonChips id='passengers' people={field.value} onChange={field.onChange} />
    </Field>
  )
}
