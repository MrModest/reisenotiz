import { Icon, IconName } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Title } from "@/components/ui/title"

export interface ItemHeaderProps {
  title: string
  icon: IconName
  buttons: { icon: IconName; isSubmit?: boolean; onClick?: () => void }[]
}

export function ItemHeader({ title, icon, buttons }: ItemHeaderProps) {
  return (
    <>
      <Title size='md' className='py-4' title={title} icon={icon} />
      <div className='flex gap-2'>
        {
          buttons.map(button => (
            <Button
              key={button.icon}
              variant='outline'
              size='icon'
              type={button.isSubmit ? 'submit' : undefined}
              onClick={button.onClick}
            >
              <Icon name={button.icon} />
            </Button>
          ))
        }
      </div>
    </>
  )
}
