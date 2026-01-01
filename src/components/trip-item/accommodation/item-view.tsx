import { formatTo, ZonedInstant } from '@/lib/datetime'
import type { Accommodation } from '@/types'
import { FieldView } from '@/components/trip-item/field-view'
import { SeparatorWithLabel } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { DateRange } from '@/components/trip-item/date-range'
import { ItemHeader } from '../item-header'
import { useNavigate } from 'react-router'

interface HotelItemViewProps {
  accommodation: Accommodation
  className?: string
}

export function AccommodationItemView({ accommodation, className }: HotelItemViewProps) {
  const navigate = useNavigate()

  return (
    <div className={className}>
      <div className='flex justify-between items-center'>
        <ItemHeader
          title={`${accommodation.site.kind} Details`}
          icon='hotel-checkIn'
          buttons={[
            { icon: 'edit', onClick: () => navigate('edit') }
          ]}
        />
      </div>
      <DateRange>
        <ReservationPoint
          label='Check In'
          time={accommodation.reservation.checkIn}
        />
        <DateRange.Separator />
        <ReservationPoint
          label='Check Out'
          time={accommodation.reservation.checkOut}
        />
      </DateRange>
      <div className='mt-4 grid grid-cols-1'>
          <FieldView label='Name' value={accommodation.site.name} />
          <FieldView
            label='Address'
            value={accommodation.site.address.line}
            subValue={`${accommodation.site.address.country}, ${accommodation.site.address.city}`}
          />
      </div>
      <SeparatorWithLabel label='Details' className='mt-2' />
      <div className='grid grid-cols-2 gap-x-2 justify-between'>
        <FieldView label='Reserved On' value={accommodation.reservedOn} />
        <FieldView label='Guests' value={accommodation.guests.toString()} />
        <FieldView label='Rooms' value={accommodation.rooms.toString()} />
        <FieldView label='Phone' value={accommodation.contact} />
      </div>
    </div>
  )
}

interface ReservationPointProps {
  label: string
  time: { available: ZonedInstant; planned?: ZonedInstant }
}

function ReservationPoint({ label, time }: ReservationPointProps) {
  return (
    <DateRange.Point>
      <div className='flex flex-row justify-between gap-4 mb-1'>
        <span className='text-muted-foreground text-sm font-semibold tracking-wide uppercase'>{label}</span>
        <span className='text-sm font-semibold tracking-wide uppercase'>{formatTo.dayShort(time.planned || time.available)}</span>
      </div>
      <div className='flex flex-row justify-between items-center gap-2'>
        <FieldView label='Available' value={formatTo.time(time.available)} />
        <FieldView className={cn({ 'invisible': !time.planned })} label='Planned' value={formatTo.time(time.planned || time.available)} />
      </div>
    </DateRange.Point>
  )
}
