import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// The item view's footer bar, below its scroller
export function DetailActions({ editTo }: { editTo: string }) {
  return (
    <div className='flex shrink-0 border-t border-border bg-background px-4 py-3'>
      <Link to={editTo} className={cn(buttonVariants({ variant: 'outline' }), 'h-9 flex-1 text-sm')}>
        Edit
      </Link>
    </div>
  )
}
