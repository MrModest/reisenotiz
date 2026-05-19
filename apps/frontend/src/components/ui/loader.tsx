import { Icon } from '@/components/icon'
import { cn } from '@/lib/utils'

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn('flex w-full items-center justify-center p-8 text-muted-foreground', className)}>
      <Icon name='loader' className='size-6 animate-spin' />
    </div>
  )
}
