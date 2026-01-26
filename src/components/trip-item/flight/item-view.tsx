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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface FlightItemViewProps {
  flight: Flight
  className?: string
}

export function FlightItemView({ flight, className }: FlightItemViewProps) {
  const duration = formatTo.duration(flight.departure.time, flight.arrival.time)
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    // TODO: Implement actual delete logic
    setDeleteDialogOpen(false)
    navigate('..')
  }

  return (
    <div className={cn('w-default', className)}>
      <div className='flex justify-between items-center'>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton={false} className='sm:max-w-fit'>
          <DialogHeader>
            <DialogTitle>Delete Flight</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this flight?<br/>This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      <div className='flex flex-row justify-between items-center gap-2'>
        <div>
          <span className='text-lg font-semibold'>{formatTo.time(point.time)}</span>
          <span className='ml-0.5 text-[0.6rem] font-light align-super'>({formatTo.utcOffset(point.time)})</span>
        </div>
        <span className='text-base font-thin'>{formatTo.dayShort(point.time)}</span>
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
