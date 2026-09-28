import { useSyncStatus, type SyncStatus } from '@/hooks/use-sync-status'
import { cn } from '@/lib/utils'

const LABEL: Record<SyncStatus, string> = {
  synced: 'Synced',
  syncing: 'Syncing',
  offline: 'Offline',
  disabled: 'Local only',
}

// The rail has room to say why a needs-attention state is nothing to worry about (#34).
const NOTE: Partial<Record<SyncStatus, string>> = {
  offline: 'Changes sync when online',
  disabled: 'No sync server set up',
}

interface SyncStatusBadgeProps {
  variant: 'header' | 'rail'
  // a collapsed rail keeps only the dot; the text moves to `title`
  collapsed?: boolean
}

export function SyncStatusBadge({ variant, collapsed = false }: SyncStatusBadgeProps) {
  const status = useSyncStatus()
  const label = LABEL[status]
  const note = variant === 'rail' ? NOTE[status] : undefined

  return (
    <div
      role='status'
      aria-live='polite'
      title={collapsed ? [label, note].filter(Boolean).join(' · ') : undefined}
      className={cn(
        'flex shrink-0 flex-col gap-1 font-mono text-[10px] tracking-[.08em] uppercase',
        status === 'offline' || status === 'disabled' ? 'text-brand' : 'text-muted-foreground',
      )}
    >
      <div className='flex items-center gap-1.5'>
        <span className={cn('size-1.5 shrink-0 rounded-full bg-current', status === 'syncing' && 'animate-pulse')} />
        {/* reserves the width of `LOCAL ONLY`, tracking included, so a state change never shifts its neighbours */}
        <span className={cn('w-[calc(10ch+.8em)] whitespace-nowrap', collapsed && 'sr-only')}>{label}</span>
      </div>
      {note && <span className={cn(collapsed && 'sr-only')}>{note}</span>}
    </div>
  )
}
