import type { FormEvent, ReactNode } from 'react'
import { FormProvider, useFormState, type FieldValues, type UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'

interface PlaceFormFrameProps<T extends FieldValues> {
  form: UseFormReturn<T>
  onSubmit: (values: T) => void
  onCancel: () => void
  children: ReactNode
}

// The frame both place forms share: the fields, then `Cancel` and `Save`, Save disabled until dirty
export function PlaceForm<T extends FieldValues>({ form, onSubmit, onCancel, children }: PlaceFormFrameProps<T>) {
  function handleSubmit(e: FormEvent) {
    // The dialog is portalled out of a trip item's form in the DOM, not in React's tree
    e.stopPropagation()
    form.handleSubmit(onSubmit)(e)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
        {children}
        <Actions form={form} onCancel={onCancel} />
      </form>
    </FormProvider>
  )
}

function Actions<T extends FieldValues>({ form, onCancel }: { form: UseFormReturn<T>; onCancel: () => void }) {
  const { isDirty } = useFormState({ control: form.control })

  return (
    <div className='mt-2 flex justify-end gap-2'>
      <Button type='button' variant='outline' onClick={onCancel}>
        Cancel
      </Button>
      <Button type='submit' disabled={!isDirty}>
        Save
      </Button>
    </div>
  )
}
