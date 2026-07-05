import { Icon, type IconName } from '@/components/icon'
import { cn } from '@/lib/utils'
import { useSyncStatus, type SyncStatus } from '@/hooks/use-sync-status'

const WARNING_CLASS = 'text-amber-600 dark:text-amber-400'

const STATUS_CONFIG: Record<SyncStatus, { icon: IconName; label: string; className?: string; spin?: boolean }> = {
  // no sync server configured — offline-first works fine, but the user should
  // still know their data isn't going anywhere else.
  disabled: { icon: 'circle-alert', label: 'Sync not configured', className: WARNING_CLASS },
  offline: { icon: 'circle-alert', label: 'Offline', className: WARNING_CLASS },
  syncing: { icon: 'refresh', label: 'Syncing…', spin: true },
  synced: { icon: 'check-circle', label: 'Synced' },
}

export function SyncStatusIndicator() {
  const status = useSyncStatus()
  const { icon, label, className, spin } = STATUS_CONFIG[status]

  return (
    <div title={label} aria-label={label} className={cn('flex items-center text-muted-foreground', className)}>
      <Icon name={icon} className={cn('size-4', spin && 'animate-spin')} />
    </div>
  )
}
