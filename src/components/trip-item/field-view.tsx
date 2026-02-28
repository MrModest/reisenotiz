import { cn } from '@/lib/utils'

export interface FieldViewProps {
  label: string
  value: string | number
  subValue?: string
  className?: string
  valueVariant?: 'default' | 'align-right'
}

export function FieldView(
  {label, value, subValue, className, valueVariant = 'default'}: FieldViewProps
) {
  return (
    <div className={cn('rounded-xs bg-muted px-3 py-2', className)}>
      <div className='text-xs text-muted-foreground font-medium uppercase tracking-wide'>{label}</div>
      <div className={cn('text-base text-foreground whitespace-pre-line', { 'text-right': valueVariant === 'align-right' })}>{value}</div>
      {subValue && (<div className='text-xs font-thin text-foreground'>{subValue}</div>)}
    </div>
  )
}
