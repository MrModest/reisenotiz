import { formatTo, ZonedInstant } from '@/lib/datetime'
import type { Hotel } from '@/types'
import { FieldView } from '@/components/trip-item/field-view'
import { SeparatorWithLabel } from '@/components/ui/separator'
import { LongRightArrowIcon } from '@/components/icon/LongRightArrowIcon'
import { cn } from '@/lib/utils'

interface HotelItemViewProps {
  hotel: Hotel
  className?: string
}

export function HotelItemView({ hotel, className }: HotelItemViewProps) {
  return (
    <div className={className}>
      <div className='flex flex-col md:flex-row gap-x-4 justify-around items-center'>
        <ReservationPoint
          label='Check In'
          time={hotel.reservation.checkIn}
        />
        <LongRightArrowIcon />
        <ReservationPoint
          label='Check Out'
          time={hotel.reservation.checkOut}
        />
      </div>
      <div className='grid grid-cols-2 mt-4 justify-between'>
        <FieldView label='Reserved On' value={hotel.reservedOn} />
        <FieldView label='Guests' value={hotel.guests.toString()} />
        <FieldView label='Rooms' value={hotel.rooms.toString()} />
        <FieldView label='Address' value={hotel.address.line} />
        <FieldView label='City' value={hotel.address.city} />
        <FieldView label='Country' value={hotel.address.country} />
        <FieldView label='Phone' value={hotel.contact} />
      </div>
      <SeparatorWithLabel label='Details' />
    </div>
  )
}

interface ReservationPointProps {
  label: string
  time: { available: ZonedInstant; planned?: ZonedInstant }
}

function ReservationPoint({ label, time }: ReservationPointProps) {
  return (
    <div className='border rounded-lg p-2 w-full md:w-fit'>
      <p className='flex flex-row justify-between gap-4 mb-1'>
        <span className='text-muted-foreground text-sm font-semibold tracking-wide uppercase'>{label}</span>
        <span className='text-sm font-semibold tracking-wide uppercase'>{formatTo.dayShort(time.planned || time.available)}</span>
      </p>
      <p className='flex flex-row justify-between items-center gap-2'>
        <FieldView label='Available' value={formatTo.time(time.available)} />
        <FieldView className={cn({ 'invisible': !time.planned })} label='Planned' value={formatTo.time(time.planned || time.available)} />
      </p>
    </div>
  )
}
