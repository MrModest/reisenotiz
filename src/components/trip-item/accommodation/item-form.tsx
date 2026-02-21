import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Accommodation, AccommodationSiteKind } from '@/types'
import { defaultsFromAccommodation, accommodationFormSchema, AccommodationFormSchema } from './edit/formSchema'
import { Field, FieldSet } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { ItemHeader } from '@/components/trip-item/item-header'
import { Separator } from '@/components/ui/separator'
import { FieldInput } from '@/components/trip-item/field-input'
import { FieldSelect } from '@/components/trip-item/field-select'
import { FieldTimezone } from '@/components/trip-item/field-timezone'
import { FieldDatePicker } from '@/components/trip-item/field-date-picker'
import { FieldTimePicker } from '@/components/trip-item/field-time-picker'
import { formatTo } from '@/lib/datetime'
import { convertTime } from '@/components/trip-item/utils'
import { Button } from '@/components/ui/button'
import { CollapsibleSection } from '@/components/trip-item/collapsible-section'
import { NoteSection } from '@/components/trip-item/section-note'
import { AttachmentsSection } from '@/components/trip-item/section-attachments'

const SITE_KIND_OPTIONS: { value: AccommodationSiteKind; label: string }[] = [
  { value: 'Hotel', label: 'Hotel' },
  { value: 'Hostel', label: 'Hostel' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Guesthouse', label: 'Guesthouse' },
  { value: 'BnB', label: 'Bed & Breakfast' },
  { value: 'Resort', label: 'Resort' },
  { value: 'Other', label: 'Other' },
]

function ReservationPointPreview({ point }: { point: 'checkIn' | 'checkOut' }) {
  const availableDate: string = useWatch({ name: `${point}.availableDate` })
  const availableTime: string = useWatch({ name: `${point}.availableTime` })
  const plannedDate: string | undefined = useWatch({ name: `${point}.plannedDate` })
  const plannedTime: string | undefined = useWatch({ name: `${point}.plannedTime` })
  const tzone: string = useWatch({ name: `${point}.tzone` })

  if (!availableDate || !availableTime || !tzone) {
    const label = point === 'checkIn' ? 'check-in' : 'check-out'
    return <span className='text-muted-foreground text-sm'>No {label} info</span>
  }

  const available = convertTime(availableDate, availableTime, tzone)
  const hasPlanned = plannedDate && plannedTime
  const planned = hasPlanned ? convertTime(plannedDate, plannedTime, tzone) : undefined

  return (
    <div className='flex flex-col gap-1 text-sm'>
      <div>
        <span className='text-muted-foreground'>Available: </span>
        <span className='font-medium'>{formatTo.date(available)} · {formatTo.time(available)}</span>
      </div>
      {planned && (
        <div>
          <span className='text-muted-foreground'>Planned: </span>
          <span className='font-medium'>{formatTo.date(planned)} · {formatTo.time(planned)}</span>
        </div>
      )}
      <div className='text-muted-foreground text-xs'>{tzone}</div>
    </div>
  )
}

function ReservationPointFields({ point }: { point: 'checkIn' | 'checkOut' }) {
  return (
    <>
      <FieldSet className='flex-row items-end gap-2 mt-2'>
        <FieldTimezone name={`${point}.tzone`} label='Timezone' required className='flex-1' />
      </FieldSet>
      <FieldSet className='grid grid-cols-2 md:flex md:flex-row items-end gap-2 mt-4'>
        <FieldDatePicker className='md:w-32' required name={`${point}.availableDate`} label='Available Date' />
        <FieldTimePicker className='md:w-20' required name={`${point}.availableTime`} label='Time' />
      </FieldSet>
      <FieldSet className='grid grid-cols-2 md:flex md:flex-row items-end gap-2 mt-2'>
        <FieldDatePicker className='md:w-32' name={`${point}.plannedDate`} label='Planned Date' />
        <FieldTimePicker className='md:w-20' name={`${point}.plannedTime`} label='Time' />
      </FieldSet>
    </>
  )
}

interface AccommodationItemFormProps {
  accommodation: Accommodation
  onSubmit: (accommodation: Accommodation) => void
  onCancel: () => void
  title?: string
  className?: string
}

export function AccommodationItemForm({ accommodation, onSubmit, onCancel, title, className }: AccommodationItemFormProps) {
  const form = useForm<AccommodationFormSchema>({
    resolver: zodResolver(accommodationFormSchema),
    defaultValues: defaultsFromAccommodation(accommodation),
    mode: 'onTouched'
  })

  function handleSubmit(data: AccommodationFormSchema) {
    const updated = convert(data, accommodation.tripId, accommodation.id)
    onSubmit(updated)
  }

  return (
    <FormProvider {...form}>
      <form className={cn('w-default mb-10', className)} onSubmit={form.handleSubmit(handleSubmit)}>

        <Field orientation='horizontal' className='flex-row items-center justify-between'>
          <ItemHeader
            title={title || 'Accommodation'}
            icon='hotel-checkIn'
            buttons={[
              { icon: 'save', isSubmit: true },
              { icon: 'cancel', onClick: onCancel }
            ]}
          />
        </Field>

        <FieldSet className='flex-row gap-2 mt-4'>
          <FieldInput name='siteName' label='Name' required className='flex-1' />
          <FieldSelect name='siteKind' label='Type' required className='w-36' options={SITE_KIND_OPTIONS} />
        </FieldSet>

        <FieldSet className='flex-row gap-2 mt-4'>
          <FieldInput name='siteAddress.country' label='Country' required />
          <FieldInput name='siteAddress.city' label='City' required />
        </FieldSet>
        <FieldSet className='mt-4'>
          <FieldInput name='siteAddress.line' label='Address Line' placeholder='Street, floor, etc.' />
        </FieldSet>

        <Separator className='my-4' />

        <FieldSet className='flex-row gap-2'>
          <FieldInput name='reservedOn' label='Reserved By' />
          <FieldInput name='contact' label='Phone / Contact' />
        </FieldSet>
        <FieldSet className='flex-row gap-2 mt-4'>
          <FieldInput name='guests' label='Guests' type='number' />
          <FieldInput name='rooms' label='Rooms' type='number' />
        </FieldSet>

        <CollapsibleSection
          label='Check-In'
          icon='hotel-checkIn'
          preview={<ReservationPointPreview point='checkIn' />}
          defaultOpen={false}
          className='mb-2 mt-6'
        >
          <ReservationPointFields point='checkIn' />
        </CollapsibleSection>

        <CollapsibleSection
          label='Check-Out'
          icon='hotel-checkOut'
          preview={<ReservationPointPreview point='checkOut' />}
          defaultOpen={false}
          className='mb-2 mt-6'
        >
          <ReservationPointFields point='checkOut' />
        </CollapsibleSection>

        <NoteSection name='note' placeholder='Add any notes about this accommodation...' />

        <AttachmentsSection name='attachments' />

        <Separator className='mt-4 mb-6' />

        <Field>
          <Button type='submit' variant='default'>Save</Button>
          <Button type='button' onClick={onCancel} variant='secondary'>Cancel</Button>
        </Field>

      </form>
    </FormProvider>
  )
}

function convert(data: AccommodationFormSchema, tripId: string, itemId: string): Accommodation {
  return {
    type: 'Accommodation',
    id: itemId,
    tripId,
    note: data.note || '',
    attachments: (data.attachments || []).map(a => ({ ...a, tripItemId: itemId, note: a.note || '' })),
    site: {
      name: data.siteName,
      kind: data.siteKind,
      address: {
        country: data.siteAddress.country,
        city: data.siteAddress.city,
        line: data.siteAddress.line,
      },
      contact: data.siteContact || '',
    },
    reservedOn: data.reservedOn,
    guests: data.guests || 0,
    rooms: data.rooms || 0,
    reservation: {
      checkIn: {
        available: convertTime(data.checkIn.availableDate, data.checkIn.availableTime, data.checkIn.tzone),
        planned: (data.checkIn.plannedDate && data.checkIn.plannedTime)
          ? convertTime(data.checkIn.plannedDate, data.checkIn.plannedTime, data.checkIn.tzone)
          : undefined,
      },
      checkOut: {
        available: convertTime(data.checkOut.availableDate, data.checkOut.availableTime, data.checkOut.tzone),
        planned: (data.checkOut.plannedDate && data.checkOut.plannedTime)
          ? convertTime(data.checkOut.plannedDate, data.checkOut.plannedTime, data.checkOut.tzone)
          : undefined,
      }
    }
  }
}
