import { Link } from 'react-router'
import { PageHeader } from '@/components/layout/page-header'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { Icon } from '@/components/icon'
import { routes } from '@/lib/routes'
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle, ItemDescription } from '@/components/ui/item'

export function RecordsPage() {
  useDocumentTitle('Places')

  return (
    <>
    <PageHeader title='Places' />
    <div className='min-h-0 flex-1 overflow-y-auto p-4'>
      <ItemGroup>
        <Item variant='outline' render={<Link to={routes.records.airports} />}>
          <ItemMedia variant='icon'>
            <Icon name='flight' />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Airports</ItemTitle>
            <ItemDescription>Manage custom airport records</ItemDescription>
          </ItemContent>
          <Icon name='chevron-right' className='size-4 text-muted-foreground' />
        </Item>
        <Item variant='outline' render={<Link to={routes.records.accommodations} />}>
          <ItemMedia variant='icon'>
            <Icon name='accommodation' />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Accommodations</ItemTitle>
            <ItemDescription>Manage custom accommodation records</ItemDescription>
          </ItemContent>
          <Icon name='chevron-right' className='size-4 text-muted-foreground' />
        </Item>
      </ItemGroup>
    </div>
    </>
  )
}
