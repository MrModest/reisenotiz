import { useState } from 'react'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Accommodation } from '@/types'
import { defaultsFromAccommodation, accommodationFormSchema, AccommodationFormSchema } from './edit/formSchema'
import { Field, FieldLegend, FieldSet } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { ItemHeader } from '@/components/trip-item/item-header'
import { Separator } from '@/components/ui/separator'
import { FieldInput } from '@/components/trip-item/field-input'
import { FieldTimezone } from '@/components/trip-item/field-timezone'
import { FieldDatePicker } from '@/components/trip-item/field-date-picker'
import { FieldTimePicker } from '@/components/trip-item/field-time-picker'
import { formatTo } from '@/lib/datetime'
import { convertTime } from '@/components/trip-item/utils'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icon'
import { getCountryFlag } from '@/lib/utils/country-flag'
import { CollapsibleSection } from '@/components/trip-item/collapsible-section'
import { NoteSection } from '@/components/trip-item/section-note'
import { AttachmentsSection } from '@/components/trip-item/section-attachments'
import { AccommodationSelector } from '@/components/ui/combobox/accommodation'
import { useAccommodations } from '@/hooks/use-accommodations'
import { AccommodationRecordDialog } from '@/components/records/accommodation-record-dialog'
import type { AccommodationSiteRecord } from '@/store/user-records/accommodations'
import { Badge } from '@/components/ui/badge'


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
      <div className='grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-end gap-2 mt-4'>
        <FieldSet className='flex-row justify-between gap-2'>
          <FieldLegend>Available</FieldLegend>
          <FieldDatePicker className='md:w-32' required name={`${point}.availableDate`} label='Date' />
          <FieldTimePicker className='md:w-20' required name={`${point}.availableTime`} label='Time' />
        </FieldSet>
        <Separator orientation='vertical' className='self-stretch hidden md:block' />
        <Separator orientation='horizontal' className='self-stretch my-2 block md:hidden' />
        <FieldSet className='flex-row justify-between gap-2'>
          <FieldLegend>Planned</FieldLegend>
          <FieldDatePicker className='md:w-32' name={`${point}.plannedDate`} label='Date' />
          <FieldTimePicker className='md:w-20' name={`${point}.plannedTime`} label='Time' />
        </FieldSet>
      </div>
    </>
  )
}

interface AccommodationItemFormProps {
  accommodation: Accommodation
  onSubmit: (accommodation: Accommodation) => void
  onCancel: () => void
  isCreate: boolean
  className?: string
}

export function AccommodationItemForm({ accommodation, onSubmit, onCancel, isCreate, className }: AccommodationItemFormProps) {
  const accommodations = useAccommodations()
  const [selectedRecord, setSelectedRecord] = useState<AccommodationSiteRecord | null>(() =>
    accommodation.site.id ? (accommodations.find((r) => r.id === accommodation.site.id) ?? null) : null
  )

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
            title={isCreate ? 'New Accommodation' : 'Edit Accommodation'}
            icon='accommodation'
            buttons={[
              { icon: 'save', isSubmit: true },
              { icon: 'cancel', onClick: onCancel }
            ]}
          />
        </Field>

        <AccommodationSiteSelector accommodations={accommodations} selected={selectedRecord} onSelectedChange={setSelectedRecord} />

        {selectedRecord && <AccommodationSitePreview record={selectedRecord} />}

        <Separator className='mt-4' />

        <FieldSet className='flex-row gap-2 mt-4'>
          <FieldInput className='grow' name='reservedOn' label='Reserved By' />
          <FieldInput className='w-16' name='guests' label='Guests' type='number' />
          <FieldInput className='w-16' name='rooms' label='Rooms' type='number' />
        </FieldSet>

        <Separator className='my-4' />

        <CollapsibleSection
          label='Check-In'
          icon='hotel-checkIn'
          preview={<ReservationPointPreview point='checkIn' />}
          className='mb-2 mt-6'
        >
          <ReservationPointFields point='checkIn' />
        </CollapsibleSection>

        <CollapsibleSection
          label='Check-Out'
          icon='hotel-checkOut'
          preview={<ReservationPointPreview point='checkOut' />}
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

interface AccommodationSiteSelectorProps {
  accommodations: AccommodationSiteRecord[]
  selected: AccommodationSiteRecord | null
  onSelectedChange: (record: AccommodationSiteRecord | null) => void
}

function AccommodationSiteSelector({ accommodations, selected, onSelectedChange }: AccommodationSiteSelectorProps) {
  const { setValue } = useFormContext<AccommodationFormSchema>()
  const [dialogOpen, setDialogOpen] = useState(false)

  function handleSelect(record: AccommodationSiteRecord | null) {
    onSelectedChange(record)
    setValue('siteId', record?.id)
    if (!record) return
    setValue('siteName', record.name)
    setValue('siteKind', record.kind)
    setValue('siteAddress', record.address)
    setValue('siteContact', record.contact || '')
  }

  return (
    <FieldSet className='flex-row items-end gap-2 mt-4'>
      <div className='flex-1'>
        <AccommodationSelector
          items={accommodations}
          selected={selected}
          onSelect={handleSelect}
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
      <AccommodationRecordDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        accommodation={selected}
        onSave={handleSelect}
      />
    </FieldSet>
  )
}

function AccommodationSitePreview({ record }: { record: AccommodationSiteRecord }) {
  const flag = record.address?.country ? getCountryFlag(record.address.country) : '🌐'
  return (
    <div className='flex items-start gap-2 mt-2 text-sm'>
      <span className='text-xl'>{flag}</span>
      <div>
        <div className='font-medium flex items-center gap-1'>
          <Badge className='rounded-xs' variant='secondary'>{record.kind}</Badge>
          {record.name}
        </div>
        <div className='text-muted-foreground'>
          {record.address.line} · {record.address.country}
        </div>
      </div>
    </div>
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
      id: data.siteId,
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
