import { Suspense } from 'react'
import { useTrips } from '@/store'
import { Trips } from '@/components/trip/trips'
import { useHeaderTitle } from '@/hooks/use-header-title'

export function TripsPage() {
  useHeaderTitle('Trips', 'trip')
  return (
    <Suspense fallback={null}>
      <TripsContent />
    </Suspense>
  )
}

function TripsContent() {
  const trips = useTrips()
  return <Trips trips={trips} className='mt-2' />
}
