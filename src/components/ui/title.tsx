import { Icon, IconName } from "@/components/icon"
import { cn } from "@/lib/utils"

export function Title({ title, icon, className }: { title: string; icon?: IconName, className?: string }) {
  return (
    <div className={cn('flex flex-row items-center', className)}>
      {icon && <Icon name={icon} className='inline-block mr-2 align-middle' />}
      <h1 className='text-2xl font-semibold'>{title}</h1>
    </div>
  )
}
