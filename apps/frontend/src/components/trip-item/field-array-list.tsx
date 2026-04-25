import { Field, FieldSet } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icon'
import { cn } from '@/lib/utils'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { FieldValues } from 'react-hook-form'

interface FieldArrayListProps<T extends FieldValues> {
  name: string
  addButtonLabel: string
  itemLabel: string
  onAdd: () => T
  className?: string
  children: (index: number, name: string) => React.ReactNode
}

export function FieldArrayList<T extends FieldValues>({
  name,
  addButtonLabel,
  itemLabel,
  onAdd,
  className,
  children,
}: FieldArrayListProps<T>) {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <Field className={cn('gap-2', className)}>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => append(onAdd())}
        className='w-full'
      >
        <Icon name='add' className='h-4 w-4 mr-2' />
        {addButtonLabel}
      </Button>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
        {fields.map((field, index) => (
          <FieldSet key={field.id} className='gap-2 p-3 border border-input rounded-md'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>
                {itemLabel} {index + 1}
              </span>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => remove(index)}
                className='h-7 w-7 p-0'
              >
                <Icon name='close' className='h-4 w-4' />
              </Button>
            </div>
            {children(index, name)}
          </FieldSet>
        ))}
      </div>
    </Field>
  )
}
