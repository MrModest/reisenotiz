import { useState } from 'react'
import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { Icon, IconName } from '@/components/icon'
import { routes } from '@/lib/routes'

interface NavigationProps {
  variant: 'sidebar' | 'bottom'
  onCollapsedChange?: (collapsed: boolean) => void
}

interface NavItem {
  to: string
  label: string
  icon: IconName
}

const navItems: NavItem[] = [
  {
    to: routes.root,
    label: 'Home',
    icon: 'home',
  },
  {
    to: routes.trips.list(),
    label: 'Trips',
    icon: 'trip',
  },
  {
    to: routes.settings,
    label: 'Settings',
    icon: 'settings',
  },
]

export function Navigation({ variant, onCollapsedChange }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onCollapsedChange?.(newCollapsed)
  }

  if (variant === 'sidebar') {
    return (
      <div className='flex flex-col h-full'>
        <div className='flex flex-col gap-2 p-4'>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'card flex items-center gap-3',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground',
                  isCollapsed && 'justify-center'
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon name={item.icon} className='size-5' />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>

        <div className='mt-auto p-4'>
          <button
            onClick={handleToggleCollapse}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors w-full',
              'hover:bg-accent hover:text-accent-foreground text-muted-foreground',
              isCollapsed && 'justify-center',
            )}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon name={isCollapsed ? 'menu' : 'sidebar-close'} className='size-5' />
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex justify-around items-center h-16 px-4'>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-md transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground'
            )
          }
        >
          <Icon name={item.icon} className='size-5' />
          <span className='text-xs font-medium'>{item.label}</span>
        </NavLink>
      ))}
    </div>
  )
}
