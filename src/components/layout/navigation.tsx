import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { Icon, IconName } from '@/components/icon/icon'

interface NavigationProps {
  variant: 'sidebar' | 'bottom'
}

interface NavItem {
  to: string
  label: string
  icon: IconName
}

const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Home',
    icon: "home",
  },
  {
    to: '/trips',
    label: 'Trips',
    icon: "trip",
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: "settings",
  },
]

export function Navigation({ variant }: NavigationProps) {
  if (variant === 'sidebar') {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div className="px-3 py-4 mb-4">
          <h1 className="text-2xl font-bold">Reisenotiz</h1>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )
            }
          >
            <Icon name={item.icon} className="size-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    )
  }

  return (
    <div className="flex justify-around items-center h-16 px-4">
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
          <Icon name={item.icon} className="size-5" />
          <span className="text-xs font-medium">{item.label}</span>
        </NavLink>
      ))}
    </div>
  )
}
