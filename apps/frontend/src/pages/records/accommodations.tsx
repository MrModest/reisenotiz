import { PageHeader } from '@/components/layout/page-header'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { routes } from '@/lib/routes'
import { AccommodationRecordsList } from '@/components/records/accommodation-records-list'

export function AccommodationsRecordsPage() {
  useDocumentTitle('Accommodations')

  return (
    <>
      <PageHeader title='Accommodations' backTo={routes.records.root} />
      <div className='min-h-0 flex-1 overflow-y-auto p-4'>
        <AccommodationRecordsList />
      </div>
    </>
  )
}
