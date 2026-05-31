import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Icon, IconName } from '@/components/icon'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  label: string
  icon?: IconName
  preview?: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}

export function CollapsibleSection({
  label,
  icon,
  preview,
  defaultOpen = false,
  open,
  onOpenChange,
  className,
  children,
}: CollapsibleSectionProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn('group w-full border border-border rounded-sm p-0 brightness-125', className)}
    >
      <CollapsibleTrigger className='w-full p-2 bg-background rounded-sm group-data-open:rounded-b-none'>
        <div className='flex items-center justify-between hover:opacity-70 transition-opacity'>
          <div className='flex items-center gap-2'>
            {icon && <Icon name={icon} className='size-4' />}
            <span className='font-medium text-sm'>{label}</span>
          </div>
          <div className='size-4 shrink-0'>
            <Icon name='edit' className='size-4 group-data-open:hidden' />
            <Icon name='check' className='size-4 hidden group-data-open:block' />
          </div>
        </div>
      </CollapsibleTrigger>
      {preview && <div className='p-2 pt-0 mt-1.5 group-data-open:hidden'>{preview}</div>}
      <CollapsibleContent className='p-2 pt-2'>{children}</CollapsibleContent>
    </Collapsible>
  )
}
