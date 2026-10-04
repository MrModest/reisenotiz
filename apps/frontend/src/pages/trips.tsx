import { Suspense } from 'react'
import { useTripSummaries } from '@/store'
import { Trips } from '@/components/trip/trips'
import { SkeletonRows } from '@/components/ui/skeleton-rows'
import { PageHeader } from '@/components/layout/page-header'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useNow } from '@/hooks/use-now'
import { groupTrips, selectHomeTrip } from '@/lib/trip'

export function TripsPage() {
  useDocumentTitle('Trips')
  return (
    <>
      <PageHeader title='Trips' />
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <Suspense fallback={<div className='p-4'><SkeletonRows /></div>}>
          <TripsContent />
        </Suspense>
      </div>
    </>
  )
}

function TripsContent() {
  const summaries = useTripSummaries()
  const now = useNow()
  const homeTrip = selectHomeTrip(summaries.map((s) => s.trip), now)
  return <Trips groups={groupTrips(summaries, now)} highlightedId={homeTrip?.id} now={now} />
}
