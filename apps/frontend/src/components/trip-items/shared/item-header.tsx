import { Icon, IconName } from '@/components/icon'
import { Button } from '@/components/ui/button'

export interface ItemHeaderProps {
  title: string
  icon: IconName
  buttons: { icon: IconName; isSubmit?: boolean; onClick?: () => void }[]
}

export function ItemHeader({ title, icon, buttons }: ItemHeaderProps) {
  return (
    <>
      <h2 className='flex items-center gap-2 py-4 text-xl font-semibold'>
        <Icon name={icon} />
        {title}
      </h2>
      <div className='flex gap-2 py-4'>
        {buttons.map((button) => (
          <Button
            key={button.icon}
            variant='outline'
            size='icon'
            type={button.isSubmit ? 'submit' : 'button'}
            onClick={button.onClick}
          >
            <Icon name={button.icon} />
          </Button>
        ))}
      </div>
    </>
  )
}
