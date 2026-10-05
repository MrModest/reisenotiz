import type { ReactNode } from 'react'

export function FactList({ children }: { children: ReactNode }) {
  return <dl className='flex flex-col'>{children}</dl>
}

// Label left, value right; the value wraps rather than pushing the label out
export function FactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex min-w-0 items-start justify-between gap-4 border-b border-border py-2.5 last:border-0'>
      <dt className='shrink-0 pt-px font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase'>{label}</dt>
      <dd className='min-w-0 text-right font-mono text-[12px] wrap-anywhere'>{children}</dd>
    </div>
  )
}
