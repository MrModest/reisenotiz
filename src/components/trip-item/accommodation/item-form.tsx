import { useState } from 'react'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Accommodation } from '@/types'
import {
  defaultsFromAccommodation,
  accommodationFormSchema,
  AccommodationFormSchema,
  AccommodationStayIntervalSchema,
} from './edit/formSchema'
import { Field, FieldSet } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { ItemHeader } from '@/components/trip-item/item-header'
import { Separator } from '@/components/ui/separator'
import { FieldInput } from '@/components/trip-item/field-input'
import { FieldDatePicker } from '@/components/trip-item/field-date-picker'
import { FieldTimePicker } from '@/components/trip-item/field-time-picker'
import { convertTime } from '@/components/trip-item/utils'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icon'
import { formatTo } from '@/lib/datetime'
import { getCountryFlag } from '@/lib/utils/country-flag'
import { CollapsibleSection } from '@/components/trip-item/collapsible-section'
import { NoteSection } from '@/components/trip-item/section-note'
import { AttachmentsSection } from '@/components/trip-item/section-attachments'
import { AccommodationSelector } from '@/components/ui/combobox/accommodation'
import { useAccommodations } from '@/hooks/use-accommodations'
import { AccommodationRecordDialog } from '@/components/records/accommodation-record-dialog'
import type { AccommodationSiteRecord } from '@/store/user-records/accommodations'
import { Badge } from '@/components/ui/badge'

function StayIntervalPreview({ tzone }: { tzone?: string }) {
  const planned = useWatch({ name: 'plannedInterval' })
  const provided = useWatch({ name: 'providedInterval' })
  const interval: AccommodationStayIntervalSchema = planned || provided

  if (!interval.dateIn || !interval.timeIn || !tzone) {
    return <span className='text-muted-foreground text-sm'>No stay interval</span>
  }

  const inTime = convertTime(interval.dateIn, interval.timeIn, tzone)
  const outTime =
    interval.dateOut && interval.timeOut ? convertTime(interval.dateOut, interval.timeOut, tzone) : undefined

  return (
    <div className='flex flex-col gap-y-0.5 gap-x-2 text-sm'>
      <div className='flex flex-row items-center gap-1'>
        <Icon name='hotel-checkIn' className='size-3.5 text-green-600/70' />
        <span className='font-medium'>
          {formatTo.date(inTime)} · {formatTo.time(inTime)}
        </span>
      </div>
      {outTime && (
        <div className='flex flex-row items-center gap-1'>
          <Icon name='hotel-checkOut' className='size-3.5 text-red-600/70' />
          <span className='font-medium'>
            {formatTo.date(outTime)} · {formatTo.time(outTime)}
          </span>
        </div>
      )}
    </div>
  )
}

function IntervalRow({
  icon,
  color,
  dateField,
  timeField,
}: {
  icon: 'hotel-checkIn' | 'hotel-checkOut'
  color: string
  dateField: string
  timeField: string
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <FieldSet className='flex-row items-end gap-1.5'>
        <Icon name={icon} className={cn(color)} />
        <FieldDatePicker className='flex-1' required name={dateField} label='Date' />
        <FieldTimePicker className='w-20' required name={timeField} label='Time' />
      </FieldSet>
    </div>
  )
}

function StayIntervalFields() {
  const plannedInterval = useWatch({ name: 'plannedInterval' })
  const { setValue, getValues } = useFormContext()
  const [showPlanned, setShowPlanned] = useState(!!plannedInterval)

  function addPlanned() {
    setValue('plannedInterval', getValues('providedInterval'))
    setShowPlanned(true)
  }

  function removePlanned() {
    setValue('plannedInterval', undefined)
    setShowPlanned(false)
  }

  return (
    <div className='flex flex-col gap-2'>
      <span className='text-xs text-muted-foreground'>Provided from Host</span>
      <IntervalRow
        icon='hotel-checkIn'
        color='text-green-600/70'
        dateField='providedInterval.dateIn'
        timeField='providedInterval.timeIn'
      />
      <IntervalRow
        icon='hotel-checkOut'
        color='text-red-600/70'
        dateField='providedInterval.dateOut'
        timeField='providedInterval.timeOut'
      />

      {showPlanned ? (
        <>
          <Separator className='my-1' />
          <div className='flex items-center justify-between'>
            <span className='text-xs text-muted-foreground'>Planned by me</span>
            <Button
              variant='ghost'
              className='text-muted-foreground/60 hover:text-foreground transition-colors'
              onClick={removePlanned}
            >
              <Icon name='x' className='size-3' />
            </Button>
          </div>
          <IntervalRow
            icon='hotel-checkIn'
            color='text-green-600/70'
            dateField='plannedInterval.dateIn'
            timeField='plannedInterval.timeIn'
          />
          <IntervalRow
            icon='hotel-checkOut'
            color='text-red-600/70'
            dateField='plannedInterval.dateOut'
            timeField='plannedInterval.timeOut'
          />
        </>
      ) : (
        <Button type='button' variant='ghost' size='sm' className='self-start text-xs h-6 px-1.5' onClick={addPlanned}>
          <Icon name='add' className='size-3' />
          Add planned times
        </Button>
      )}
    </div>
  )
}

interface AccommodationItemFormProps {
  accommodation: Accommodation
  onSubmit: (accommodation: Accommodation) => void
  onCancel: () => void
  isCreate: boolean
  className?: string
}

export function AccommodationItemForm({
  accommodation,
  onSubmit,
  onCancel,
  isCreate,
  className,
}: AccommodationItemFormProps) {
  const accommodations = useAccommodations()
  const [selectedRecord, setSelectedRecord] = useState<AccommodationSiteRecord | null>(() =>
    accommodation.site.id ? (accommodations.find((r) => r.id === accommodation.site.id) ?? null) : null,
  )

  const form = useForm<AccommodationFormSchema>({
    resolver: zodResolver(accommodationFormSchema),
    defaultValues: defaultsFromAccommodation(accommodation),
    mode: 'onTouched',
  })

  function handleSubmit(data: AccommodationFormSchema) {
    const updated = convert(data, accommodation.tripId, accommodation.id)
    onSubmit(updated)
  }

  return (
    <FormProvider {...form}>
      <form
        className={cn('w-default mb-10', className)}
        onSubmit={form.handleSubmit(handleSubmit, (errors) => console.error('[form validation]', errors))}
      >
        <Field orientation='horizontal' className='flex-row items-center justify-between'>
          <ItemHeader
            title={isCreate ? 'New Accommodation' : 'Edit Accommodation'}
            icon='accommodation'
            buttons={[
              { icon: 'save', isSubmit: true },
              { icon: 'cancel', onClick: onCancel },
            ]}
          />
        </Field>

        <AccommodationSiteSelector
          accommodations={accommodations}
          selected={selectedRecord}
          onSelectedChange={setSelectedRecord}
        />

        {selectedRecord && <AccommodationSitePreview record={selectedRecord} />}

        <Separator className='mt-4' />

        <FieldSet className='flex-row gap-2 mt-4'>
          <FieldInput className='grow' name='reservedOn' label='Reserved By' />
          <FieldInput className='w-16' name='guests' label='Guests' type='number' />
          <FieldInput className='w-16' name='rooms' label='Rooms' type='number' />
        </FieldSet>

        <Separator className='my-4' />

        <CollapsibleSection
          label='Stay Interval'
          icon='accommodation'
          preview={<StayIntervalPreview tzone={selectedRecord?.tzone} />}
          className='mt-4'
        >
          <StayIntervalFields />
        </CollapsibleSection>

        <NoteSection name='note' placeholder='Add any notes about this accommodation...' />

        <AttachmentsSection name='attachments' />

        <Separator className='mt-4 mb-6' />

        <Field>
          <Button type='submit' variant='default'>
            Save
          </Button>
          <Button type='button' onClick={onCancel} variant='secondary'>
            Cancel
          </Button>
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
    if (!record) return
    setValue('site', {
      id: record.id,
      name: record.name,
      kind: record.kind,
      address: record.address,
      contact: record.contact || '',
      tzone: record.tzone,
    })
  }

  return (
    <FieldSet className='flex-row items-end gap-2 mt-4'>
      <div className='flex-1'>
        <AccommodationSelector items={accommodations} selected={selected} onSelect={handleSelect} />
      </div>
      <Button type='button' variant='outline' onClick={() => setDialogOpen(true)}>
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
          <Badge className='rounded-xs' variant='secondary'>
            {record.kind}
          </Badge>
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
  const { site } = data
  const tzone = site.tzone

  return {
    type: 'Accommodation',
    id: itemId,
    tripId,
    note: data.note || '',
    attachments: (data.attachments || []).map((a) => ({ ...a, tripItemId: itemId, note: a.note || '' })),
    site,
    reservedOn: data.reservedOn,
    guests: data.guests || 0,
    rooms: data.rooms || 0,
    stayInterval: {
      provided: {
        in: convertTime(data.providedInterval.dateIn, data.providedInterval.timeIn, tzone),
        out: convertTime(data.providedInterval.dateOut, data.providedInterval.timeOut, tzone),
      },
      planned: data.plannedInterval
        ? {
            in: convertTime(data.plannedInterval.dateIn, data.plannedInterval.timeIn, tzone),
            out: convertTime(data.plannedInterval.dateOut, data.plannedInterval.timeOut, tzone),
          }
        : undefined,
    },
  }
}
