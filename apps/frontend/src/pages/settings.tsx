import { Link } from 'react-router'
import { useHeaderTitle } from '@/hooks/use-header-title'
import { Icon } from '@/components/icon'
import { routes } from '@/lib/routes'
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle, ItemDescription } from '@/components/ui/item'

export function SettingsPage() {
  useHeaderTitle('Settings')

  return (
    <div className='p-4 w-default'>
      <ItemGroup>
        <Item variant='outline' render={<Link to={routes.records.root} />}>
          <ItemMedia variant='icon'>
            <Icon name='inbox' />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Records</ItemTitle>
            <ItemDescription>Manage custom airports and other records</ItemDescription>
          </ItemContent>
          <Icon name='chevron-right' className='size-4 text-muted-foreground' />
        </Item>
      </ItemGroup>
    </div>
  )
}
