import { Icon } from '@/components/icon'
import { formatTo } from '@/lib/datetime'
import type { Flight, FlightPoint } from '@/types'
import { FieldView } from '@/components/trip-item/field-view'
import { cn } from '@/lib/utils'

interface FlightItemViewProps {
  flight: Flight
  className?: string
}

export function FlightItemView({ flight, className }: FlightItemViewProps) {
  const duration = formatTo.duration(flight.departure.time, flight.arrival.time)

  return (
    <div className={className}>
      <div className='flex flex-col md:flex-row gap-x-4 justify-around items-center'>
        <FlightPoint point={flight.departure} />
        <div className='grid grid-cols-[1fr_auto_1fr] items-center'>
          <div className='flex-1 border border-current' />
          <span className='text-xs text-center whitespace-nowrap px-1'>{duration}</span>
          <Icon name='arrow-right' />
        </div>
        <FlightPoint point={flight.arrival} />
      </div>
      <div className='grid grid-cols-2 mt-4 justify-between'>
        <FieldView label='Airline' value={flight.carrier} />
        <FieldView label='Flight' value={flight.flightNumber} />
        <FieldView label='Booking' value={flight.bookingCode} />
        <FieldView label='Seat' value={flight.seat} />
      </div>
    </div>
  )
}

function FlightPoint( { point }: { point: FlightPoint }) {
  return (
    <div className='border rounded-lg p-2 w-full md:w-fit'>
      <p className='flex flex-row justify-between'>
        <span className='text-primary font-bold'>{point.airport.code}</span>
        <span className='text-primary/80'>{point.airport.address.city}</span>
      </p>
      <p className='flex flex-row justify-between items-center gap-2'>
        <span className='text-xl font-bold'>{formatTo.time(point.time)}</span>
        <span className='text-base font-thin'>{formatTo.dayShort(point.time)}</span>
      </p>
      <p className='flex flex-row flex-wrap gap-2 text-xs items-center justify-between'>
        <span>Terminal: {point.terminal}</span>
        <span className='flex flex-row items-center gap-x-1'>
          <span>Gate:</span>
          <span>{!!point.gate ? point.gate : <Icon name='no-data' className='inline-block size-3 my-0.5' />}</span>
        </span>
      </p>
    </div>
  )
}
