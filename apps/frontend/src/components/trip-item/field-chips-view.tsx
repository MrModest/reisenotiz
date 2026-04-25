import { Icon, IconName } from '@/components/icon'
import { Badge } from '@/components/ui/badge'

export interface FieldChipsViewProps {
  label: string
  icon: IconName
  items: {
    value: string
    link?: string
  }[]
}

export function FieldChipsView({ label, icon, items }: FieldChipsViewProps) {
  return (
    <div className='rounded-xs bg-muted px-3 py-2'>
      <div className='text-xs text-muted-foreground font-medium uppercase tracking-wide'>{label}</div>
      <div className='flex flex-row flex-wrap gap-2 mt-1'>
        {items.map((item) => (
          <Badge
            key={item.value}
            variant='outline'
            className='h-7 text-base px-2 rounded-xs'
            render={
              item.link
              ? <a href={item.link} target='_blank' rel='noopener noreferrer' />
              : undefined
            }
          >
            <Icon name={icon} />
            {item.value}
          </Badge>
        ))}
      </div>
    </div>
  )
}
