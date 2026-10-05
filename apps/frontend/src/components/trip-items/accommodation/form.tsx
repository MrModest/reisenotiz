import { useState } from 'react'
import { FieldErrors, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Accommodation, AccommodationSite } from '@/types'
import {
  defaultsFromAccommodation,
  accommodationFormSchema,
  AccommodationFormSchema,
  AccommodationStayIntervalSchema,
} from './schema'
import { FieldSet } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import type { TripItemFormProps } from '../module'
import { FormActions } from '@/components/trip-items/shared/form-actions'
import { Separator } from '@/components/ui/separator'
import { FieldInput } from '@/components/trip-items/shared/field-input'
import { FieldDatePicker } from '@/components/trip-items/shared/field-date-picker'
import { FieldTimePicker } from '@/components/trip-items/shared/field-time-picker'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icon'
import { formatTo, convertTime } from '@/lib/datetime'
import { getCountryFlag } from '@/lib/utils/country-flag'
import { countryName } from '@/services'
import { CollapsibleSection } from '@/components/trip-items/shared/collapsible-section'
import { FieldErrorAt } from '@/components/trip-items/shared/field-errors'
import { NoteSection } from '@/components/trip-items/shared/section-note'
import { AttachmentsSection } from '@/components/trip-items/shared/section-attachments'
import { AccommodationSelector, type SavedSiteEntry } from '@/components/ui/combobox/accommodation'
import { useSavedPlaces } from '@/store'
import { PlaceDialog } from '@/components/places/place-dialog'
import { Badge } from '@/components/ui/badge'

function StayIntervalPreview() {
  const tzone: string | undefined = useWatch({ name: 'site.tzone' })
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
          {formatTo.dayShort(inTime)} · {formatTo.time(inTime)}
        </span>
      </div>
      {outTime && (
        <div className='flex flex-row items-center gap-1'>
          <Icon name='hotel-checkOut' className='size-3.5 text-red-600/70' />
          <span className='font-medium'>
            {formatTo.dayShort(outTime)} · {formatTo.time(outTime)}
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

export function AccommodationForm({ item: accommodation, onSubmit, onCancel }: TripItemFormProps<Accommodation>) {
  const places = useSavedPlaces()
  const accommodations = places.filter((e): e is SavedSiteEntry => e.type === 'AccommodationSite' && !e.place.archived)
  // The stay holds a copy of its site, so the saved site it came from is found by what it says
  // The stay holds a copy with no key back to its saved site, so only a site picked here is known
  // by key; until then the picker starts empty and offers `Add`, never an `Edit` of a guessed site
  const [selectedRecord, setSelectedRecord] = useState<SavedSiteEntry | null>(null)

  const form = useForm<AccommodationFormSchema>({
    resolver: zodResolver(accommodationFormSchema),
    defaultValues: defaultsFromAccommodation(accommodation),
    mode: 'onTouched',
  })

  const [stayIntervalOpen, setStayIntervalOpen] = useState(false)

  function handleSubmit(data: AccommodationFormSchema) {
    const updated = convert(data, accommodation.tripId, accommodation.id)
    onSubmit(updated)
  }

  function handleInvalid(errors: FieldErrors<AccommodationFormSchema>) {
    if (errors.providedInterval || errors.plannedInterval) {
      setStayIntervalOpen(true)
    }
  }

  return (
    <FormProvider {...form}>
      <form className='flex min-h-0 flex-1 flex-col' onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}>
        <div className='min-h-0 flex-1 overflow-y-auto px-4 pb-4'>
          <AccommodationSiteSelector
            accommodations={accommodations}
            selected={selectedRecord}
            onSelectedChange={setSelectedRecord}
          />
          <FieldErrorAt name='site' className='text-xs font-thin' />

          <AccommodationSitePreview />

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
            preview={<StayIntervalPreview />}
            open={stayIntervalOpen}
            onOpenChange={setStayIntervalOpen}
            className='mt-4'
          >
            <StayIntervalFields />
          </CollapsibleSection>

          <NoteSection name='note' placeholder='Add any notes about this accommodation...' />

          <AttachmentsSection name='attachments' />
        </div>
        <FormActions onCancel={onCancel} />
      </form>
    </FormProvider>
  )
}

interface AccommodationSiteSelectorProps {
  accommodations: SavedSiteEntry[]
  selected: SavedSiteEntry | null
  onSelectedChange: (record: SavedSiteEntry | null) => void
}

function AccommodationSiteSelector({ accommodations, selected, onSelectedChange }: AccommodationSiteSelectorProps) {
  const { setValue } = useFormContext<AccommodationFormSchema>()
  const [dialogOpen, setDialogOpen] = useState(false)

  function handleSelect(record: SavedSiteEntry | null) {
    onSelectedChange(record)
    if (!record) return
    const { name, kind, address, contact, tzone } = record.place
    setValue('site', { name, kind, address, contact: contact || '', tzone }, { shouldValidate: true })
  }

  return (
    <FieldSet className='flex-row items-end gap-2 mt-4'>
      <div className='flex-1'>
        <AccommodationSelector items={accommodations} selected={selected} onSelect={handleSelect} />
      </div>
      <Button type='button' variant='outline' onClick={() => setDialogOpen(true)}>
        <Icon name={selected ? 'edit' : 'add'} />
        {selected ? 'Edit' : 'Add'}
      </Button>
      {dialogOpen && (
        <PlaceDialog
          type='AccommodationSite'
          placeKey={selected?.key}
          onSaved={(key, place) => handleSelect({ type: 'AccommodationSite', key, place })}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </FieldSet>
  )
}

// The copy the stay will save, whether it came with the stay or from a pick
function AccommodationSitePreview() {
  const record: AccommodationSite = useWatch({ name: 'site' })
  if (!record?.name) return null
  const flag = getCountryFlag(record.address.countryCode)
  return (
    <div className='flex items-start gap-2 mt-2 text-sm'>
      <span className='text-xl'>{flag}</span>
      <div>
        <div className='font-medium flex items-center gap-1'>
          <Badge className='rounded-sm' variant='secondary'>
            {record.kind}
          </Badge>
          {record.name}
        </div>
        <div className='text-muted-foreground'>
          {record.address.line} · {countryName(record.address.countryCode)}
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
