import { useHeaderTitle, useHeaderBackButton } from '@/hooks/use-header-title'
import { AccommodationRecordsList } from '@/components/records/accommodation-records-list'

export function AccommodationsRecordsPage() {
  useHeaderTitle('Accommodations')
  useHeaderBackButton(true)

  return (
    <div className='p-4 w-default'>
      <AccommodationRecordsList />
    </div>
  )
}
