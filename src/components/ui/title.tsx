import { Icon, IconName } from '@/components/icon'
import { cn } from '@/lib/utils'

const textSize = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
}

export function Title({
  title,
  size = 'xl',
  icon,
  className,
}: {
  title: string
  size?: keyof typeof textSize
  icon?: IconName
  className?: string
}) {
  return (
    <div className={cn('flex flex-row items-center', className)}>
      {icon && <Icon name={icon} className='inline-block mr-2 align-middle' />}
      <h1 className={cn(textSize[size], 'font-semibold')}>{title}</h1>
    </div>
  )
}
