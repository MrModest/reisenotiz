import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatTo, type DateTime } from '@/lib/datetime'
import { getHomeCountdown, getTripDuration, getTripStatus, type TripSummary } from '@/lib/trip'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

const capsLabel = 'font-mono text-[10px] tracking-[.08em] uppercase'

interface HomeTripCardProps {
  // `selectHomeTrip`'s pick; none when no trip is ongoing or upcoming
  summary?: TripSummary
  now: DateTime
}

export function HomeTripCard({ summary, now }: HomeTripCardProps) {
  if (!summary) {
    return <div className='rounded-xl border border-border bg-card p-4 text-muted-foreground'>No upcoming trips</div>
  }

  const { trip, itemCount } = summary
  const duration = getTripDuration(trip)
  const countdown = getHomeCountdown(trip, now)

  return (
    <div className='flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-card p-4'>
      <div className={cn(capsLabel, 'text-brand')}>
        {getTripStatus(trip, now) === 'ongoing' ? 'Ongoing trip' : 'Upcoming trip'}
      </div>
      <h2 data-slot='home-trip-name' className='line-clamp-2 text-[27px] leading-tight font-semibold break-words'>
        {trip.name}
      </h2>
      <div className='font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase'>
        {formatTo.dateRange(trip.startDate, trip.endDate)} · {duration} {duration === 1 ? 'day' : 'days'} · {itemCount}{' '}
        {itemCount === 1 ? 'item' : 'items'}
      </div>
      <Separator />
      {countdown && (
        <div>
          <div className='text-[36px] leading-none font-semibold text-brand tabular-nums uppercase'>{countdown.value}</div>
          {countdown.caption && (
            <div className={cn(capsLabel, 'mt-1.5 text-muted-foreground')}>{countdown.caption}</div>
          )}
        </div>
      )}
      <Link
        data-slot='home-open-timeline'
        to={routes.trips.trip(trip.id)}
        className={cn(buttonVariants(), 'mt-1 h-9 w-full px-4 text-sm')}
      >
        Open timeline
      </Link>
    </div>
  )
}
