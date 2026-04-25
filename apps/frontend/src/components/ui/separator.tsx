import { Separator as SeparatorPrimitive } from '@base-ui/react/separator'

import { cn } from '@/lib/utils'

function Separator({ className, orientation = 'horizontal', ...props }: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot='separator'
      orientation={orientation}
      className={cn(
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch',
        className,
      )}
      {...props}
    />
  )
}

function SeparatorWithLabel({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn('grid grid-cols-[1fr_auto_1fr] items-center gap-2', className)}>
      <Separator orientation='horizontal' />
      <span className='text-neutral-600 text-nowrap'>{label}</span>
      <Separator orientation='horizontal' />
    </div>
  )
}

export { Separator, SeparatorWithLabel }
