import { useState } from 'react'
import { Icon } from '@/components/icon'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import type { DateTime } from '@/lib/datetime'
import type { TripGroup } from '@/lib/trip'
import { CreateTripDialog } from './create-trip-dialog'
import { TripRow } from './trip-row'

interface TripsProps {
  groups: TripGroup[]
  highlightedId?: string
  now: DateTime
}

export function Trips({ groups, highlightedId, now }: TripsProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className='flex flex-col pb-4'>
      {/* ponytail: the create entry stays until #70's floating + and trip form page replace it */}
      <Item
        variant='outline'
        size='sm'
        onClick={() => setDialogOpen(true)}
        className='mx-4 mt-4 cursor-pointer hover:bg-accent hover:text-accent-foreground'
      >
        <ItemMedia>
          <Icon name='add' />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>New Trip</ItemTitle>
        </ItemContent>
      </Item>
      {groups.length === 0 && <p className='px-4 pt-5 text-muted-foreground'>No trips yet</p>}
      {groups.map((group) => (
        <section key={group.label}>
          <h2 className='flex items-center gap-2 px-4 pt-5 pb-2 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase'>
            {group.label}
            {group.count !== undefined && <span className='text-foreground'>{group.count}</span>}
          </h2>
          {group.trips.map((summary) => (
            <TripRow key={summary.trip.id} summary={summary} now={now} highlighted={summary.trip.id === highlightedId} />
          ))}
        </section>
      ))}
      <CreateTripDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
