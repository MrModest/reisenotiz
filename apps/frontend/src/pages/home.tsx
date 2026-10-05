import { Suspense } from 'react'
import { useTripSummaries } from '@/store'
import { AllTimeStatsMockup } from '@/components/home/all-time-stats-mockup'
import { HomeTripCard } from '@/components/home/home-trip-card'
import { PageHeader } from '@/components/layout/page-header'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useNow } from '@/hooks/use-now'
import { selectHomeTrip } from '@/lib/trip'

export function HomePage() {
  useDocumentTitle('Overview')
  return (
    <>
      <PageHeader title='Overview' mobileTitle='Reisenotiz' />
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div data-slot='home' className='grid items-start gap-6 p-4'>
          {/* Two regions: the card waits on the trip files, `All time` paints at once */}
          <Suspense fallback={null}>
            <HomeTripContent />
          </Suspense>
          <Suspense fallback={null}>
            <AllTimeStatsMockup />
          </Suspense>
        </div>
      </div>
    </>
  )
}

function HomeTripContent() {
  const summaries = useTripSummaries()
  const now = useNow()
  return <HomeTripCard summary={selectHomeTrip(summaries, now)} now={now} />
}
