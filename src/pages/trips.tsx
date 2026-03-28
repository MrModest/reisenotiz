import { useTrips } from '@/store'
import { Trips } from '@/components/trip/trips'
import { useHeaderTitle } from '@/hooks/use-header-title'

export function TripsPage() {
  const trips = useTrips()

  useHeaderTitle('Trips', 'trip')

  return <Trips trips={trips} className='mt-2' />
}
