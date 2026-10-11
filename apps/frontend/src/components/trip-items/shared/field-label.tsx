import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { Required } from '@/components/ui/required'

// The mono caps label over a control, tied to it by `htmlFor`
export function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className='gap-1 font-mono text-[10px] font-normal tracking-[.08em] text-muted-foreground uppercase'>
      {children}
      {required && <Required />}
    </Label>
  )
}

// The same mono caps label heading a block that is not a control
export function SectionLabel({ children }: { children: ReactNode }) {
  return <h3 className='font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase'>{children}</h3>
}

// A labelled group of controls inside a form: a heading over a rule, with an optional action beside it
export function FormGroup({ label, action, children }: { label: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-label={label} className='flex flex-col gap-3 pt-3'>
      <div className='flex items-baseline justify-between gap-3 border-b border-border pb-2 font-mono text-[10px] tracking-[.08em] uppercase'>
        <h3>{label}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}
