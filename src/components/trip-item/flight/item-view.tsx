import { Icon } from '@/components/icon'
import { formatTo } from '@/lib/datetime'
import type { Airport, Flight, FlightPoint } from '@/types'
import { FieldView } from '@/components/trip-item/field-view'
import { Separator, SeparatorWithLabel } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
        <LongRightArrowIcon label={duration} />
        <FlightPoint point={flight.arrival} />
      </div>
      <div className='grid grid-cols-2 mt-4 justify-between'>
        <FieldView label='Airline' value={flight.carrier} />
        <FieldView label='Flight' value={flight.flightNumber} />
        <FieldView label='Booking' value={flight.bookingCode} />
        <FieldView label='Seat' value={flight.seat} />
      </div>
      <SeparatorWithLabel label='Details' />
      <Tabs defaultValue='departure'>
        <TabsList>
          <TabsTrigger value='departure'>Departure</TabsTrigger>
          <TabsTrigger value='arrival'>Arrival</TabsTrigger>
        </TabsList>
        <TabsContent value='departure'>
          <AirportDetails airport={flight.departure.airport} />
        </TabsContent>
        <TabsContent value='arrival'>
          <AirportDetails airport={flight.arrival.airport} />
        </TabsContent>
      </Tabs>
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
        <div>
          <span className='text-lg font-semibold'>{formatTo.time(point.time)}</span>
          <span className='ml-0.5 text-[0.6rem] font-light align-super'>({formatTo.utcOffset(point.time)})</span>
        </div>
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

function AirportDetails({ airport }: { airport: Airport }) {
  return (
    <div className='flex flex-col gap-2'>
      <FieldView label='Airport' value={airport.name} />
      <FieldView label='Address' value={airport.address.line} />
    </div>
  )
}

function LongRightArrowIcon({ label }: { label: string }) {
  return (
    <div className='grid grid-cols-[1fr_auto_1fr] items-center'>
      <div className='flex-1 border border-current' />
      <span className='text-xs text-center whitespace-nowrap px-1'>{label}</span>
      <Icon name='arrow-right' />
    </div>
  )
}
