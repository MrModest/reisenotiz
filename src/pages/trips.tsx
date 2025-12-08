import { trips } from '@/stubs/trips'
import { Trips } from '@/components/trip/trips'
import { useHeaderTitle } from '@/hooks/use-header-title'

export function TripsPage() {
  useHeaderTitle('Trips', 'trip')

  return (
    <Trips trips={trips} className='mt-2' />
  )
}
