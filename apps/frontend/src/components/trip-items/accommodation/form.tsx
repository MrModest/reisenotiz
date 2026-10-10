import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FieldError } from '@/components/ui/field'
import { useFormField } from '@/hooks/use-form-field'
import { useSavedPlaces } from '@/store'
import type { Accommodation } from '@/types'
import type { TripItemFormProps } from '../module'
import { DateTimeField } from '../shared/date-time-field'
import { FieldAttachments } from '../shared/field-attachments'
import { FieldInput } from '../shared/field-input'
import { FieldLabel, SectionLabel } from '../shared/field-label'
import { FieldTextarea } from '../shared/field-textarea'
import { FormActions } from '../shared/form-actions'
import { PersonChips } from '../shared/person-chips'
import { PlacePicker } from '../shared/place-picker'
import { unusedNightNote } from './nights'
import { hasPlan, isComplete, NO_PLAN, stayFormSchema, stayFormValues, stayFromFormValues, toStayInterval, type StayFormValues } from './schema'

export function AccommodationForm({ item: stay, onSubmit, onCancel }: TripItemFormProps<Accommodation>) {
  const places = useSavedPlaces()
  const form = useForm<StayFormValues>({
    resolver: zodResolver(stayFormSchema(places)),
    defaultValues: stayFormValues(stay),
    mode: 'onTouched',
  })

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(stayFromFormValues(values, stay, places)))}
        className='flex min-h-0 flex-1 flex-col'
      >
        <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4'>
          <PlacePicker type='AccommodationSite' name='placeKey' label='Property' />
          <DateTimeField dateName='provided.dateIn' timeName='provided.timeIn' dateLabel='Check-in' timeLabel='From' />
          <DateTimeField dateName='provided.dateOut' timeName='provided.timeOut' dateLabel='Check-out' timeLabel='By' />
          <PlanGroup />
          <div className='pt-3'>
            <GuestsField />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <FieldInput name='rooms' label='Rooms' type='number' inputMode='numeric' inputClassName='font-mono' />
            <FieldInput name='reservedOn.fullname' label='Reserved by' />
          </div>
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

// The traveller's own arrival and departure, optional, within the booking
function PlanGroup() {
  const { setValue } = useFormContext<StayFormValues>()
  const [provided, planned] = useWatch<StayFormValues, ['provided', 'planned']>({ name: ['provided', 'planned'] })
  // Both intervals are wall-clock values in the one site zone, so any shared zone gives the same days
  const note =
    isComplete(provided) && isComplete(planned)
      ? unusedNightNote({ provided: toStayInterval(provided, 'UTC'), planned: toStayInterval(planned, 'UTC') })
      : undefined

  return (
    <section aria-label='Plan' className='flex flex-col gap-3 pt-3'>
      <div className='flex items-baseline justify-between gap-3 border-b border-border pb-2 font-mono text-[10px] tracking-[.08em] uppercase'>
        <h3>Plan</h3>
        <div className='flex min-w-0 items-baseline gap-3'>
          {note && <span className='text-right text-brand'>{note}</span>}
          {hasPlan(planned) && (
            <button
              type='button'
              className='shrink-0 text-muted-foreground uppercase hover:text-foreground'
              onClick={() => setValue('planned', NO_PLAN, { shouldDirty: true, shouldValidate: true })}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <DateTimeField dateName='planned.dateIn' timeName='planned.timeIn' dateLabel='You arrive' timeLabel='At' />
      <DateTimeField dateName='planned.dateOut' timeName='planned.timeOut' dateLabel='You leave' timeLabel='At' />
    </section>
  )
}

function GuestsField() {
  const { field } = useFormField('guests')
  const { field: draft, error } = useFormField('guestDraft')

  return (
    <Field className='gap-1.5'>
      <FieldLabel htmlFor='guests'>Guests</FieldLabel>
      <PersonChips id='guests' people={field.value} onChange={field.onChange} draft={draft.value} onDraftChange={draft.onChange} />
      {error && <FieldError className='text-xs font-thin'>{error.message}</FieldError>}
    </Field>
  )
}
