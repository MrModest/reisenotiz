import { Icon, type IconName } from '@/components/icon'
import { cn } from '@/lib/utils'
import { useSyncStatus } from '@/hooks/use-sync-status'

const STATUS_CONFIG: Record<'offline' | 'syncing' | 'synced', { icon: IconName; label: string; spin?: boolean }> = {
  offline: { icon: 'cloud-off', label: 'Offline' },
  syncing: { icon: 'loader', label: 'Syncing…', spin: true },
  synced: { icon: 'cloud-check', label: 'Synced' },
}

export function SyncStatusIndicator() {
  const status = useSyncStatus()
  if (status === 'disabled') return null

  const { icon, label, spin } = STATUS_CONFIG[status]

  return (
    <div title={label} aria-label={label} className='flex items-center text-muted-foreground'>
      <Icon name={icon} className={cn('size-4', spin && 'animate-spin')} />
    </div>
  )
}
