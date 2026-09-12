import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Icon, IconName } from '@/components/icon'
import { cn } from '@/lib/utils'

function CommandDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* arbitrary width on purpose — this theme's --spacing-* scale shadows Tailwind's
          named container sizes, collapsing them to a few px. See sizing-utilities.test.ts */}
      <DialogContent
        showCloseButton={false}
        className='w-full max-w-[calc(100%-2rem)] overflow-hidden p-0 sm:max-w-[32rem]'
      >
        <DialogTitle className='sr-only'>{title}</DialogTitle>
        <DialogDescription className='sr-only'>{description}</DialogDescription>
        <div data-slot='command' className='flex flex-col'>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <div className='border-border flex items-center gap-2 border-b px-3'>
      <Icon name='search' className='text-muted-foreground size-4 shrink-0' />
      <input
        data-slot='command-input'
        type='text'
        role='combobox'
        autoComplete='off'
        aria-expanded='true'
        className={cn(
          'placeholder:text-muted-foreground h-10 w-full bg-transparent text-sm outline-none',
          'focus-visible:outline-none',
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='command-list'
      role='listbox'
      className={cn('max-h-72 overflow-y-auto overscroll-contain p-1', className)}
      {...props}
    />
  )
}

function CommandEmpty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='command-empty'
      role='status'
      className={cn('text-muted-foreground py-6 text-center text-sm', className)}
      {...props}
    />
  )
}

function CommandGroup({
  heading,
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & { heading: string }) {
  return (
    <div data-slot='command-group' role='group' aria-label={heading} className={cn('py-1', className)} {...props}>
      <div className='text-muted-foreground px-2 py-1 text-xs font-medium'>{heading}</div>
      {children}
    </div>
  )
}

function CommandItem({
  icon,
  selected = false,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onSelect'> & { icon?: IconName; selected?: boolean }) {
  return (
    <div
      data-slot='command-item'
      role='option'
      aria-selected={selected}
      className={cn(
        'flex min-h-8 cursor-default items-center gap-2 rounded-md px-2 py-1 text-sm select-none',
        'aria-selected:bg-accent aria-selected:text-accent-foreground',
        className,
      )}
      {...props}
    >
      {icon && <Icon name={icon} className='size-4 shrink-0' />}
      {children}
    </div>
  )
}

export { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem }
