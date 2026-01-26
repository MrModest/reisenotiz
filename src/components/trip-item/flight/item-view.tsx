import { Icon } from '@/components/icon'
import { formatTo } from '@/lib/datetime'
import type { Airport, Flight, FlightPoint } from '@/types'
import { FieldView } from '@/components/trip-item/field-view'
import { SeparatorWithLabel } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DateRange } from '../date-range'
import { useNavigate } from 'react-router'
import { ItemHeader } from '../item-header'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface FlightItemViewProps {
  flight: Flight
  className?: string
  onDelete: () => void
}

export function FlightItemView({ flight, className, onDelete }: FlightItemViewProps) {
  const duration = formatTo.duration(flight.departure.time, flight.arrival.time)
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    setDeleteDialogOpen(false)
    onDelete()
  }

  return (
    <div className={cn('w-default', className)}>
      <div className='flex justify-between items-center w-full'>
        <ItemHeader
          title='Flight Details'
          icon='flight'
          buttons={[
            { icon: 'edit', onClick: () => navigate('edit') },
            { icon: 'trash', onClick: () => setDeleteDialogOpen(true) }
          ]}
        />
      </div>
      <DateRange>
        <FlightPoint point={flight.departure} />
        <DateRange.Separator label={duration} />
        <FlightPoint point={flight.arrival} />
      </DateRange>
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Delete Flight'
        description={
          <>
            Are you sure you want to delete <b>{flight.flightNumber}</b>?<br/>
            This action cannot be undone.
          </>
        }
        onConfirm={handleDelete}
        confirmLabel='Delete'
      />
    </div>
  )
}

function FlightPoint( { point }: { point: FlightPoint }) {
  return (
    <DateRange.Point>
      <p className='flex flex-row justify-between'>
        <span className='text-primary font-bold'>{point.airport.code}</span>
        <span className='text-primary/80'>{point.airport.address.city}</span>
      </p>
      <div className='flex flex-row justify-between items-start gap-2'>
        <div className='flex flex-col'>
          <span className='-mb-1.5 pb-0 text-[0.6rem] text-right font-light text-muted-foreground'>{formatTo.utcOffset(point.time)}</span>
          <span className='text-lg font-semibold'>{formatTo.time(point.time)}</span>
        </div>
        <div className='flex flex-col items-end'>
          <span className='pb-0 -mb-1.5 font-light text-muted-foreground text-[0.6rem]'>{formatTo.weekday(point.time)}</span>
          <span className='text-lg '>{formatTo.dayMonth(point.time)}</span>
        </div>
      </div>
      <p className='flex flex-row flex-wrap gap-2 text-xs items-center justify-between'>
        <span>Terminal: {point.terminal}</span>
        <span className='flex flex-row items-center gap-x-1'>
          <span>Gate:</span>
          <span>{!!point.gate ? point.gate : <Icon name='no-data' className='inline-block size-3 my-0.5' />}</span>
        </span>
      </p>
    </DateRange.Point>
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
