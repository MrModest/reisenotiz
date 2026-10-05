import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

interface ChipRowProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onValueChange: (value: T) => void
  'aria-label': string
  className?: string
}

// Exactly one chip is on: `ToggleGroup` speaks arrays and lets the active chip be pressed off,
// so the adapter unwraps the array and ignores the press that would leave nothing selected.
export function ChipRow<T extends string>({ options, value, onValueChange, 'aria-label': label, className }: ChipRowProps<T>) {
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={(next: string[]) => {
        if (next.length > 0) onValueChange(next[0] as T)
      }}
      variant='outline'
      className={cn('w-auto min-w-0 overflow-x-auto [scrollbar-width:none]', className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className='h-7 max-w-40 shrink-0 truncate rounded-sm px-2.5 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase aria-pressed:text-foreground'
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
