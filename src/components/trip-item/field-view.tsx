import { Separator } from '@/components/ui/separator'

export function FieldView({label, value}: {label: string; value: string}) {
  return (
    <div className='flex flex-row py-1'>
      <Separator orientation='vertical' className='mr-1' />
      <div>
        <div className='text-xs text-neutral-600'>{label}</div>
        <div className='text-base font-medium'>{value}</div>
      </div>
    </div>
  )
}
