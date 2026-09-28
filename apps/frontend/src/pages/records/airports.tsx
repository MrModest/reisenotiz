import { PageHeader } from '@/components/layout/page-header'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { routes } from '@/lib/routes'
import { AirportRecordsList } from '@/components/records/airport-records-list'

export function AirportsRecordsPage() {
  useDocumentTitle('Airports')

  return (
    <>
      <PageHeader title='Airports' backTo={routes.records.root} />
      <div className='min-h-0 flex-1 overflow-y-auto p-4'>
        <AirportRecordsList />
      </div>
    </>
  )
}
