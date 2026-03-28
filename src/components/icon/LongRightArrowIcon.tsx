import { cn } from '@/lib/utils'
import { Icon } from '.'

export function LongRightArrowIcon({ label }: { label?: string }) {
  return (
    <div className='flex flex-row items-center'>
      <div className={cn('flex-1 border border-current w-5', { '-mr-3': !label })} />
      <span className='text-xs text-center whitespace-nowrap px-1'>{label}</span>
      <Icon name='arrow-right' />
    </div>
  )
}
