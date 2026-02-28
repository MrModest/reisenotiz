import { Person } from '@/types'
import { Icon } from '@/components/icon'
import { Badge } from '@/components/ui/badge'

export function FieldPersonView({ person }: { person: Person }) {
  return (
    <Badge variant='secondary' className='h-7 text-xs px-3'>
      <Icon name='person' />
      {person.fullname}
    </Badge>
  )
}
