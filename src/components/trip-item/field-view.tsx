import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function FieldView({label, value, className}: {label: string; value: string, className?: string}) {
  return (
    <div className={cn('flex flex-row py-1', className)}>
      <Separator orientation='vertical' className='mr-1' />
      <div>
        <div className='text-xs text-muted-foreground font-medium uppercase tracking-wide'>{label}</div>
        <div className='text-lg font-semibold text-foreground'>{value}</div>
      </div>
    </div>
  )
}
