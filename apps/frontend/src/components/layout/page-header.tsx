import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon, type IconName } from '@/components/icon'
import { useGoBack } from '@/hooks/use-go-back'
import { SyncStatusBadge } from './sync-status-badge'

interface PageHeaderProps {
  // '' while a trip file loads: the slot stays empty and keeps its height
  title: string
  // Home only: the phone has no rail to carry the app name
  mobileTitle?: string
  subtitle?: string
  icon?: IconName
  backTo?: string
  actions?: ReactNode
  children?: ReactNode
}

// `data-shell` marks what only one presentation shows. `AppShell` owns the breakpoint and hides it.
export function PageHeader({ title, mobileTitle, subtitle, icon, backTo, actions, children }: PageHeaderProps) {
  return (
    <header data-slot='page-header' className='flex shrink-0 flex-col gap-3 border-b border-border px-4 py-2.5'>
      <div className='flex min-h-9 min-w-0 items-center gap-1.5'>
        {backTo && <BackLink to={backTo} />}
        {icon && <Icon name={icon} className='size-[18px] shrink-0 text-muted-foreground' />}
        <div className={icon ? 'min-w-0 flex-1 pl-1' : 'min-w-0 flex-1'}>
          <h1 data-slot='page-title' className='truncate text-[17px] leading-tight font-semibold'>
            {mobileTitle ? (
              <>
                <span data-shell='desktop'>{title}</span>
                <span data-shell='mobile'>{mobileTitle}</span>
              </>
            ) : title}
          </h1>
          {subtitle && (
            <p className='truncate font-mono text-[11px] tracking-[.04em] text-muted-foreground uppercase'>{subtitle}</p>
          )}
        </div>
        <div data-shell='mobile'>
          <SyncStatusBadge variant='header' />
        </div>
        {actions}
      </div>
      {children}
    </header>
  )
}

function BackLink({ to }: { to: string }) {
  const goBack = useGoBack(to)

  return (
    <Link
      to={to}
      replace
      aria-label='Back'
      className='-ml-2 grid size-9 shrink-0 place-items-center rounded-md hover:bg-accent/50'
      onClick={(e) => {
        e.preventDefault()
        goBack()
      }}
    >
      <Icon name='back' className='size-[18px]' />
    </Link>
  )
}
