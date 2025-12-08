import { formatTo, ZonedInstant } from '@/lib/datetime'
import type { Hotel } from '@/types'
import { FieldView } from '@/components/trip-item/field-view'
import { SeparatorWithLabel } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { DateRange } from '@/components/trip-item/date-range'

interface HotelItemViewProps {
  hotel: Hotel
  className?: string
}

export function HotelItemView({ hotel, className }: HotelItemViewProps) {
  return (
    <div className={className}>
      <DateRange>
        <ReservationPoint
          label='Check In'
          time={hotel.reservation.checkIn}
        />
        <DateRange.Separator />
        <ReservationPoint
          label='Check Out'
          time={hotel.reservation.checkOut}
        />
      </DateRange>
      <div className='mt-4 grid grid-cols-1'>
          <FieldView label='Name' value={hotel.name} />
          <FieldView
            label='Address'
            value={hotel.address.line}
            subValue={`${hotel.address.country}, ${hotel.address.city}`}
          />
      </div>
      <SeparatorWithLabel label='Details' />
      <div className='grid grid-cols-2 gap-x-2 justify-between'>
        <FieldView label='Reserved On' value={hotel.reservedOn} />
        <FieldView label='Guests' value={hotel.guests.toString()} />
        <FieldView label='Rooms' value={hotel.rooms.toString()} />
        <FieldView label='Phone' value={hotel.contact} />
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
