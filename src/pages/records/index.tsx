import { Link } from 'react-router'
import { useHeaderTitle, useHeaderBackButton } from '@/hooks/use-header-title'
import { Icon } from '@/components/icon'
import { routes } from '@/lib/routes'
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  ItemDescription,
} from '@/components/ui/item'

export function RecordsPage() {
  useHeaderTitle('Records')
  useHeaderBackButton(true)

  return (
    <div className='p-4 w-default'>
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
      </ItemGroup>
    </div>
  )
}
