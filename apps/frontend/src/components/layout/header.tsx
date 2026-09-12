import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Icon, IconName } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { HeaderAction } from '@/contexts/header-context'
import { Title } from '../ui/title'
import { SyncStatusIndicator } from './sync-status-indicator'
import { useCommandMenu } from '@/components/command-menu'

interface HeaderProps {
  title?: string
  icon?: IconName
  actions?: HeaderAction[]
  onBack?: () => void
  showBackButton?: boolean
}

export function Header({ title = 'Reisenotiz', icon, actions = [], onBack, showBackButton = false }: HeaderProps) {
  const navigate = useNavigate()
  const { openCommandMenu } = useCommandMenu()

  useEffect(() => {
    if (title !== 'Reisenotiz') {
      document.title = title + ' - Reisenotiz'
    } else {
      document.title = 'Reisenotiz'
    }
  }, [title])

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <header className='border-b border-border bg-background sticky top-0 z-10'>
      <div className='p-3 flex flex-row items-center justify-between'>
        <div className='flex flex-row items-center space-x-2'>
          {showBackButton && (
            <Button variant='ghost' size='icon' onClick={handleBack} aria-label='Go back'>
              <Icon name='back' />
            </Button>
          )}
          <Title title={title} icon={icon || 'logo'} />
        </div>
        <div className='flex flex-row items-center space-x-2'>
          <SyncStatusIndicator />
          <Button variant='ghost' size='icon' onClick={openCommandMenu} aria-label='Open command menu'>
            <Icon name='search' />
          </Button>
          {actions.map((action) => (
            <Button
              key={action.label || action.icon}
              variant='outline'
              size={action.label ? undefined : 'icon'}
              onClick={action.onClick}
              aria-label={action.label ? undefined : (action.ariaLabel ?? action.icon)}
            >
              {action.icon && <Icon name={action.icon} data-icon='inline-start' />}
              {action.label && <span className='ml-2'>{action.label}</span>}
            </Button>
          ))}
        </div>
      </div>
    </header>
  )
}
