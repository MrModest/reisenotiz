import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { Icon, type IconName } from '@/components/icon'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { SyncStatusBadge } from './sync-status-badge'

interface NavEntry {
  to: string
  label: string
  icon: IconName
}

const navEntries: NavEntry[] = [
  { to: routes.root, label: 'Home', icon: 'home' },
  { to: routes.trips.list(), label: 'Trips', icon: 'luggage' },
  { to: routes.records.root, label: 'Places', icon: 'bookmark' },
  { to: routes.settings, label: 'Settings', icon: 'settings' },
]

const RAIL_COLLAPSED_KEY = 'rail-collapsed'

// The one place the 900px `shell` breakpoint is used. Both navigations are always rendered and CSS
// hides one; `data-shell` marks the parts of a `PageHeader` that only one presentation shows.
export function AppShell() {
  return (
    <div
      className={cn(
        'flex h-dvh flex-col overflow-hidden bg-background text-foreground shell:flex-row',
        'max-shell:**:data-[shell=desktop]:hidden shell:**:data-[shell=mobile]:hidden',
        'shell:**:data-[slot=page-header]:px-6 shell:**:data-[slot=page-header]:py-3.5',
        'shell:**:data-[slot=page-title]:text-xl',
      )}
    >
      <Rail />
      <main className='flex min-h-0 min-w-0 flex-1 flex-col'>
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}

function Rail() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(RAIL_COLLAPSED_KEY) === 'true')

  function toggle() {
    localStorage.setItem(RAIL_COLLAPSED_KEY, String(!collapsed))
    setCollapsed(!collapsed)
  }

  return (
    <nav
      aria-label='Primary'
      className={cn(
        'hidden shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar shell:flex',
        collapsed ? 'w-16' : 'w-[232px]',
      )}
    >
      <div className='flex h-14 shrink-0 items-center px-5 text-[15px] font-semibold text-sidebar-foreground'>
        {!collapsed && 'Reisenotiz'}
      </div>
      <div className={cn('flex flex-col gap-0.5 px-2', collapsed && 'items-center')}>
        {navEntries.map((entry) => (
          <NavLink
            key={entry.to}
            to={entry.to}
            end={entry.to === routes.root}
            title={collapsed ? entry.label : undefined}
            aria-label={collapsed ? entry.label : undefined}
            className={({ isActive }) =>
              cn(
                'group flex items-center rounded-md text-[13px] font-medium transition-colors duration-150 hover:bg-accent/50',
                collapsed ? 'size-10 justify-center' : 'h-9 gap-3 px-3',
                isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground',
              )
            }
          >
            <Icon name={entry.icon} className='size-5 shrink-0 group-aria-[current=page]:text-sidebar-primary' />
            {!collapsed && entry.label}
          </NavLink>
        ))}
      </div>
      <div className={cn('mt-auto flex flex-col gap-1 px-2 pb-4', collapsed && 'items-center gap-2')}>
        <button
          type='button'
          onClick={toggle}
          title={collapsed ? 'Expand' : undefined}
          aria-label={collapsed ? 'Expand' : undefined}
          className={cn(
            'flex items-center rounded-md text-[13px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent/50',
            collapsed ? 'size-10 justify-center' : 'h-9 gap-3 px-3',
          )}
        >
          <Icon name={collapsed ? 'sidebar-open' : 'sidebar-close'} className='size-[18px] shrink-0' />
          {!collapsed && 'Collapse'}
        </button>
        <div className={collapsed ? 'grid size-10 place-items-center' : 'px-3 pt-2'}>
          <SyncStatusBadge variant='rail' collapsed={collapsed} />
        </div>
      </div>
    </nav>
  )
}

function TabBar() {
  return (
    <nav
      aria-label='Main'
      className='grid shrink-0 grid-cols-4 border-t border-border bg-card px-2 pt-1.5 pb-[env(safe-area-inset-bottom,22px)] shell:hidden'
    >
      {navEntries.map((entry) => (
        <NavLink
          key={entry.to}
          to={entry.to}
          end={entry.to === routes.root}
          className={({ isActive }) =>
            cn(
              'flex min-h-11 min-w-[52px] flex-col items-center justify-center gap-1 rounded-md',
              isActive ? 'text-brand' : 'text-muted-foreground',
            )
          }
        >
          <Icon name={entry.icon} className='size-5' />
          <span className='text-[10px] font-medium'>{entry.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
