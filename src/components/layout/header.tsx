import { useEffect } from 'react'
import { Icon, IconName } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { HeaderAction } from '@/contexts/header-context'
import { Title } from '../ui/title'

interface HeaderProps {
  title?: string;
  icon?: IconName;
  actions?: HeaderAction[];
}

export function Header({ title = 'Reisenotiz', icon, actions = [] }: HeaderProps) {
  useEffect(() => {
    if (title !== 'Reisenotiz') {
      document.title = title + ' - Reisenotiz'
    } else {
      document.title = 'Reisenotiz'
    }
  }, [title])

  return (
    <header className='border-b border-border bg-background sticky top-0 z-10'>
      <div className='p-3 flex flex-row items-center justify-between'>
        <Title title={title} icon={icon || 'logo'} />
        <div className='flex flex-row items-center space-x-2'>
          {(actions).map(action => (
            <Button
              key={action.label || action.icon}
              variant='outline'
              size={action.label ? undefined : 'icon'}
              onClick={action.onClick}
            >
              {action.icon && <Icon name={action.icon} />}
              {action.label && <span className='ml-2'>{action.label}</span>}
            </Button>
          ))}
        </div>
      </div>
    </header>
  )
}
