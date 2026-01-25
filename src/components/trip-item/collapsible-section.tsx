import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Icon, IconName } from '@/components/icon'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  label: string
  icon?: IconName
  preview?: React.ReactNode
  defaultOpen?: boolean
  className?: string
  children: React.ReactNode
}

export function CollapsibleSection({
  label,
  icon,
  preview,
  defaultOpen = false,
  className,
  children
}: CollapsibleSectionProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={cn('group border border-border rounded-sm p-0 bg-muted', className)}
    >
      <CollapsibleTrigger className='w-full p-2 bg-background group-data-[state=closed]:rounded-sm group-data-[state=open]:rounded-t-sm'>
        <div className='flex items-center justify-between hover:opacity-70 transition-opacity'>
          <div className='flex items-center gap-2'>
            {icon && <Icon name={icon} className='w-4 h-4' />}
            <span className='text-muted-foreground font-medium text-sm'>{label}</span>
          </div>
          <div className='w-4 h-4 shrink-0'>
            <Icon
              name='edit'
              className='w-4 h-4 group-data-[state=open]:hidden'
            />
            <Icon
              name='check'
              className='w-4 h-4 hidden group-data-[state=open]:block'
            />
          </div>
        </div>
      </CollapsibleTrigger>
      {preview && (
        <div className='p-2 pt-0 mt-1.5 group-data-[state=open]:hidden'>
          {preview}
        </div>
      )}
      <CollapsibleContent className='p-2 pt-2'>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
