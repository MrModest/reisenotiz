import { Suspense } from 'react'
import { useTrips } from '@/store'
import { Trips } from '@/components/trip/trips'
import { Loader } from '@/components/ui/loader'
import { useHeaderTitle } from '@/hooks/use-header-title'

export function TripsPage() {
  useHeaderTitle('Trips', 'trip')
  return (
    <Suspense fallback={<Loader />}>
      <TripsContent />
    </Suspense>
  )
}

function TripsContent() {
  const trips = useTrips()
  return <Trips trips={trips} className='mt-2' />
}
