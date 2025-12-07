import { formatTo, ZonedInstant } from '@/lib/datetime'
import type { Hotel } from '@/types'
import { FieldView } from '@/components/trip-item/field-view'
import { SeparatorWithLabel } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LongRightArrowIcon } from '@/components/icon/LongRightArrowIcon'

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
          inOut='in'
        />
        <LongRightArrowIcon />
        <ReservationPoint
          label='Check Out'
          time={hotel.reservation.checkOut}
          inOut='out'
        />
      </div>
      <div className='grid grid-cols-2 mt-4 justify-between'>
        <FieldView label='Reserved On' value={hotel.reservedOn} />
        <FieldView label='Guests' value={hotel.guests.toString()} />
        <FieldView label='Rooms' value={hotel.rooms.toString()} />
      </div>
      <SeparatorWithLabel label='Details' />
      <Tabs defaultValue='address'>
        <TabsList>
          <TabsTrigger value='address'>Address</TabsTrigger>
          <TabsTrigger value='contact'>Contact</TabsTrigger>
        </TabsList>
        <TabsContent value='address'>
          <div className='flex flex-col gap-2'>
            <FieldView label='Address' value={hotel.address.line} />
            <FieldView label='City' value={hotel.address.city} />
            <FieldView label='Country' value={hotel.address.country} />
          </div>
        </TabsContent>
        <TabsContent value='contact'>
          <div className='flex flex-col gap-2'>
            <FieldView label='Phone' value={hotel.contact} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ReservationPointProps {
  label: string
  time: { available: ZonedInstant; planned?: ZonedInstant }
  inOut: 'in' | 'out'
}

function ReservationPoint({ label, time, inOut }: ReservationPointProps) {
  const availablePrefix = inOut === 'in' ? 'from' : 'until'

  return (
    <div className='border rounded-lg p-2 w-full md:w-fit'>
      <p className='flex flex-row justify-between gap-4'>
        <span className='text-muted-foreground font-bold'>{label}</span>
        <span className='text-base font-thin'>{formatTo.dayShort(time.planned || time.available)}</span>
      </p>
      <p className='flex flex-row justify-between items-center gap-2'>
        <FieldView label='Planned' value={formatTo.time(time.planned || time.available)} />
        {time.planned && (
          <FieldView label='Available' value={`${availablePrefix} ${formatTo.time(time.available)}`} />
        )}
      </p>
    </div>
  )
}
