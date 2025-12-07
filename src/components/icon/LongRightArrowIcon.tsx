import { Icon } from "."

export function LongRightArrowIcon({ label }: { label?: string }) {
  return (
    <div className='grid grid-cols-[1fr_auto_1fr] items-center'>
      <div className='flex-1 border border-current -mr-1' />
      {label && <span className='text-xs text-center whitespace-nowrap px-1'>{label}</span>}
      <Icon name='arrow-right' />
    </div>
  )
}
