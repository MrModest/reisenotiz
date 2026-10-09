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
