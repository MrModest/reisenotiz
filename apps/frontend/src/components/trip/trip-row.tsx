import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatTo, type DateTime } from '@/lib/datetime'
import { getTripCountdown, type TripSummary } from '@/lib/trip'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { useDeleteTrip } from '@/store'

interface TripRowProps {
  summary: TripSummary
  now: DateTime
  highlighted: boolean
}

export function TripRow({ summary: { trip, itemCount }, now, highlighted }: TripRowProps) {
  const navigate = useNavigate()
  const deleteTrip = useDeleteTrip()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const countdown = getTripCountdown(trip, now)

  return (
    <div
      className={cn(
        'flex min-w-0 items-start gap-3 border-b border-border px-4 py-3 transition-colors duration-150 hover:bg-accent/50',
        highlighted && 'border-l-2 border-l-brand bg-accent text-accent-foreground hover:bg-accent',
      )}
    >
      <Link to={routes.trips.trip(trip.id)} className='flex min-w-0 flex-1 items-start gap-3'>
        <div className='flex w-[38px] shrink-0 flex-col items-center pt-0.5'>
          <div className='font-mono text-[16px] leading-tight'>{formatTo.dayOfMonth(trip.startDate)}</div>
          <div className='font-mono text-[10px] text-muted-foreground uppercase'>{formatTo.monthShort(trip.startDate)}</div>
        </div>
        <div className='line-clamp-2 min-w-0 flex-1 text-[17px] leading-snug font-semibold'>{trip.name}</div>
        <div className='flex shrink-0 flex-col items-end gap-1 pt-0.5'>
          <Chip>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Chip>
          {countdown && <Chip className='text-brand'>{countdown}</Chip>}
        </div>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant='ghost' size='icon-sm' aria-label='Trip actions' className='-my-1 -mr-2 text-muted-foreground' />}
        >
          <Icon name='more' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-auto'>
          <DropdownMenuItem onClick={() => navigate(routes.trips.edit(trip.id))}>Edit</DropdownMenuItem>
          <DropdownMenuItem variant='destructive' onClick={() => setConfirmOpen(true)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
    </div>
  )
}

function Chip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center rounded-sm border border-border px-1.5 font-mono text-[10px] tracking-[.08em] whitespace-nowrap text-muted-foreground uppercase',
        className,
      )}
    >
      {children}
    </span>
  )
}
