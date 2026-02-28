import { cn } from '@/lib/utils'

export function FieldView({label, value, subValue, className}: {label: string; value: string | number; subValue?: string; className?: string}) {
  return (
    <div className={cn('rounded-xs bg-muted px-3 py-2', className)}>
      <div className='text-xs text-muted-foreground font-medium uppercase tracking-wide'>{label}</div>
      <div className='text-base text-foreground whitespace-pre-line'>{value}</div>
      {subValue && (<div className='text-xs font-thin text-foreground'>{subValue}</div>)}
    </div>
  )
}
