import { useHeaderTitle, useHeaderBackButton } from '@/hooks/use-header-title'
import { AirportRecordsList } from '@/components/records/airport-records-list'

export function AirportsRecordsPage() {
  useHeaderTitle('Airports')
  useHeaderBackButton(true)

  return (
    <div className='p-4 w-default'>
      <AirportRecordsList />
    </div>
  )
}
