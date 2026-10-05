import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon, type IconName } from '@/components/icon'
import { getTripItemModule } from '@/components/trip-items/registry'
import { formatTo, type ZonedInstant } from '@/lib/datetime'
import type { TimelineDay } from '@/lib/timeline'
import { cn } from '@/lib/utils'

interface TimelineRowProps {
  element: TimelineDay['elements'][number]
  to: string
  selected: boolean
}

export function TimelineRow({ element, to, selected }: TimelineRowProps) {
  return (
    <RowShell to={to} selected={selected} at={element.at} otherDay={element.otherDay} icon={getTripItemModule(element.type)?.icon ?? 'unknown'}>
      <div className='truncate text-[14px] leading-5 font-medium'>{element.title}</div>
      <div className='truncate font-mono text-[11px] tracking-[.04em] text-muted-foreground uppercase'>{element.summary}</div>
    </RowShell>
  )
}

// An item from a newer build: no time to place it by, so it sits after the days, muted
export function UnknownItemRow({ type, to, selected }: { type: string; to: string; selected: boolean }) {
  return (
    <RowShell to={to} selected={selected} icon='unknown' className='text-muted-foreground'>
      <div className='truncate text-[14px] leading-5'>Unsupported item</div>
      <div className='truncate font-mono text-[11px] tracking-[.04em] uppercase'>{type}</div>
    </RowShell>
  )
}

export function TimelineDayHeader({ date }: { date: ZonedInstant }) {
  // the app's only `position: sticky`; no ancestor up to the scroller may set overflow or transform
  return <h2 className='sticky top-0 border-y border-border bg-card px-4 py-2 text-[13px] font-medium'>{formatTo.dayShort(date)}</h2>
}

interface RowShellProps {
  to: string
  selected: boolean
  icon: IconName
  at?: ZonedInstant
  otherDay?: boolean
  className?: string
  children: ReactNode
}

function RowShell({ to, selected, icon, at, otherDay, className, children }: RowShellProps) {
  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-11 min-w-0 items-stretch gap-3 px-4 transition-colors duration-150 hover:bg-accent/50',
        selected && 'border-l-2 border-l-brand bg-accent text-accent-foreground hover:bg-accent',
        className,
      )}
    >
      <div data-slot='timeline-time' className='w-11 shrink-0 py-2.5 text-right font-mono'>
        {at && <div className='text-[13px] leading-5'>{formatTo.time(at)}</div>}
        {at && otherDay && <div className='text-[10px] text-destructive uppercase'>{formatTo.dayMonth(at)}</div>}
      </div>
      <div className='w-px shrink-0 bg-border' />
      <div className='flex min-w-0 flex-1 items-start gap-2.5 py-2.5'>
        <Icon name={icon} className={cn('mt-0.5 size-4 shrink-0', selected ? 'text-brand' : 'text-muted-foreground')} />
        <div className='min-w-0 flex-1'>{children}</div>
      </div>
    </Link>
  )
}
