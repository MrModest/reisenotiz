import { Icon, type IconName } from '@/components/icon'
import { cn } from '@/lib/utils'
import { useSyncStatus } from '@/hooks/use-sync-status'

const STATUS_CONFIG: Record<
  'offline' | 'syncing' | 'synced',
  { icon: IconName; label: string; className?: string; spin?: boolean }
> = {
  offline: { icon: 'circle-alert', label: 'Offline', className: 'text-amber-600 dark:text-amber-400' },
  syncing: { icon: 'refresh', label: 'Syncing…', spin: true },
  synced: { icon: 'check-circle', label: 'Synced' },
}

export function SyncStatusIndicator() {
  const status = useSyncStatus()
  if (status === 'disabled') return null

  const { icon, label, className, spin } = STATUS_CONFIG[status]

  return (
    <div title={label} aria-label={label} className={cn('flex items-center text-muted-foreground', className)}>
      <Icon name={icon} className={cn('size-4', spin && 'animate-spin')} />
    </div>
  )
}
