import { useEffect } from 'react'
import { Icon, IconName } from '@/components/icon'

interface HeaderProps {
  title?: string;
  icon?: IconName;
}

export function Header({ title = 'Reisenotiz', icon }: HeaderProps) {
  useEffect(() => {
    if (title !== 'Reisenotiz') {
      document.title = title + ' - Reisenotiz'
    } else {
      document.title = 'Reisenotiz'
    }
  }, [title])

  return (
    <header className='border-b border-border bg-background sticky top-0 z-10'>
      <div className='px-4 py-4 flex flex-row items-center'>
        <Icon name={icon || 'logo'} className='inline-block mr-2 align-middle' />
        <h1 className='text-2xl font-semibold'>{title}</h1>
      </div>
    </header>
  )
}
