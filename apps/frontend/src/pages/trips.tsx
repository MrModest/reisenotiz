import { Suspense } from 'react'
import { Link } from 'react-router'
import { useTripSummaries } from '@/store'
import { Icon } from '@/components/icon'
import { TripRow } from '@/components/trip/trip-row'
import { SkeletonRows } from '@/components/ui/skeleton-rows'
import { PageHeader } from '@/components/layout/page-header'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useNow } from '@/hooks/use-now'
import { groupTrips, selectHomeTrip } from '@/lib/trip'
import { routes } from '@/lib/routes'

export function TripsPage() {
  useDocumentTitle('Trips')
  return (
    <>
      <PageHeader title='Trips' />
      <div className='relative min-h-0 flex-1'>
        <div className='h-full overflow-y-auto'>
          <Suspense fallback={<div className='p-4'><SkeletonRows /></div>}>
            <TripsContent />
          </Suspense>
        </div>
        <Link
          to={routes.trips.new}
          aria-label='New trip'
          className='absolute right-4 bottom-4 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/80'
        >
          <Icon name='plus' className='size-[22px]' />
        </Link>
      </div>
    </>
  )
}

function TripsContent() {
  const summaries = useTripSummaries()
  const now = useNow()
  const highlightedId = selectHomeTrip(summaries, now)?.trip.id
  const groups = groupTrips(summaries, now)

  // pb-20 keeps the last row's ··· clear of the floating +
  return (
    <div className='flex flex-col pb-20'>
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
    </div>
  )
}
