import type { ReactNode } from 'react'
import type { TripItemModule } from '@/components/trip-items/module'
import type { TripItemType } from '@/types'

interface TimelineChipsProps {
  modules: TripItemModule[]
  value: TripItemType | undefined
  onChange: (value: TripItemType | undefined) => void
}

// Single-select, with `ALL` as a member and always first
export function TimelineChips({ modules, value, onChange }: TimelineChipsProps) {
  return (
    <div role='group' aria-label='Filter' className='flex gap-1.5 overflow-x-auto'>
      <Chip pressed={!value} onClick={() => onChange(undefined)}>All</Chip>
      {modules.map((m) => (
        <Chip key={m.type} pressed={value === m.type} onClick={() => onChange(m.type)}>{m.label}</Chip>
      ))}
    </div>
  )
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type='button'
      aria-pressed={pressed}
      onClick={onClick}
      className='h-7 shrink-0 rounded-sm border border-border px-2.5 font-mono text-[10px] tracking-[.08em] whitespace-nowrap text-muted-foreground uppercase transition-colors duration-150 hover:bg-accent/50 aria-pressed:border-input aria-pressed:bg-accent aria-pressed:text-accent-foreground'
    >
      {children}
    </button>
  )
}
