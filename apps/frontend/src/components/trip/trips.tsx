import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Icon } from '@/components/icon'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import { formatTo } from '@/lib/datetime'
import type { Trip } from '@/types'
import { useDeleteTrip } from '@/store'
import { routes } from '@/lib/routes'
import { CreateTripDialog } from './create-trip-dialog'

interface TripsProps {
  trips: Trip[]
  className?: string
}

export function Trips({ trips, className }: TripsProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className={cn('flex flex-col gap-2 w-default', className)}>
      <Item
        variant='outline'
        size='sm'
        onClick={() => setDialogOpen(true)}
        className='cursor-pointer hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98] transition-transform'
      >
        <ItemMedia>
          <Icon name='add' />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>New Trip</ItemTitle>
        </ItemContent>
      </Item>
      {trips.map((trip) => (
        <TripItem key={trip.id} trip={trip} />
      ))}
      <CreateTripDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

function TripItem({ trip }: { trip: Trip }) {
  const navigate = useNavigate()
  const deleteTrip = useDeleteTrip()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <Item
        variant='outline'
        size='sm'
        onClick={() => navigate(routes.trips.trip(trip.id))}
        className='cursor-pointer hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98] transition-transform'
      >
        <ItemMedia>
          <Icon name='trip' />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{trip.name}</ItemTitle>
          <ItemDescription>
            {formatTo.dateShort(trip.startDate)} - {formatTo.dateShort(trip.endDate)}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={(e) => {
              e.stopPropagation()
              setConfirmOpen(true)
            }}
          >
            <Icon name='trash' />
          </Button>
        </ItemActions>
      </Item>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title='Delete Trip'
        description={
          <>
            Are you sure you want to delete <b>{trip.name}</b>?<br />
            This action cannot be undone.
          </>
        }
        confirmLabel='Delete'
        onConfirm={() => deleteTrip(trip.id)}
      />
    </>
  )
}
