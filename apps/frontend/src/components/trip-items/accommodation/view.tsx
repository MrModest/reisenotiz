import { formatTo } from '@/lib/datetime'
import { countryName } from '@/services'
import type { Accommodation } from '@/types'
import { FieldView } from '@/components/trip-items/shared/field-view'
import { Separator, SeparatorWithLabel } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { FieldChipsView } from '../shared/field-chips-view'
import { DetailActions } from '../shared/detail-actions'
import { routes } from '@/lib/routes'

export function AccommodationView({ item: accommodation }: { item: Accommodation }) {
  return (
    <>
      <div className='min-h-0 flex-1 overflow-y-auto p-4'>
        <div className='grid grid-cols-[1fr_auto_1fr] gap-3 bg-card py-2 px-3 rounded-xl'>
          <ReservationPoint label='Check In' stayInterval={accommodation.stayInterval} />
          <Separator orientation='vertical' />
          <ReservationPoint label='Check Out' stayInterval={accommodation.stayInterval} />
        </div>
        <div className='mt-4 grid grid-cols-1 gap-2'>
          <FieldView label={`Name (${accommodation.site.kind})`} value={accommodation.site.name} />
          <FieldView
            label='Address'
            value={accommodation.site.address.line || 'Unknown'}
            subValue={`${countryName(accommodation.site.address.countryCode)}, ${accommodation.site.address.city}`}
          />
          {accommodation.site.contact && <FieldView label='Contact' value={accommodation.site.contact} />}
        </div>
        <SeparatorWithLabel label='Details' className='mt-2' />
        <div className='flex gap-2 mb-2'>
          <FieldView className='grow' label='Reserved On' value={accommodation.reservedOn || ''} />
          <FieldView className='w-18' valueVariant='align-right' label='Guests' value={accommodation.guests} />
          <FieldView className='w-18' valueVariant='align-right' label='Rooms' value={accommodation.rooms} />
        </div>

        {accommodation.attachments.length > 0 && (
          <FieldChipsView
            label='Attachments'
            icon='attachment'
            items={accommodation.attachments.map((a) => ({ value: a.name, link: a.link }))}
          />
        )}
        {accommodation.note && <FieldView label='Notes' value={accommodation.note} className='mt-2' />}
      </div>
      <DetailActions editTo={routes.trips.editItem(accommodation.tripId, accommodation.id)} />
    </>
  )
}

interface ReservationPointProps {
  label: string
  stayInterval: Accommodation['stayInterval']
}

function ReservationPoint({ label, stayInterval }: ReservationPointProps) {
  const time =
    label === 'Check In'
      ? stayInterval.planned?.in || stayInterval.provided.in
      : stayInterval.planned?.out || stayInterval.provided.out

  return (
    <div className={cn('flex flex-col', { 'items-end': label === 'Check Out' })}>
      <span className='text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2'>{label}</span>
      <span className='text-base font-semibold tracking-wide uppercase'>{formatTo.dayShort(time)}</span>
      <span className='text-lg'>{formatTo.time(time)}</span>
    </div>
  )
}
