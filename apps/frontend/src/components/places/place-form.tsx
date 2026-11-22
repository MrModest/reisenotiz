import { FormProvider, useForm, useFormState, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import type { AnyPlace } from '@/types'
import { getPlaceTypeModule } from './registry'

interface PlaceFormProps {
  place: AnyPlace
  onSubmit: (place: AnyPlace) => void
  onCancel: () => void
}

// The type's fields, then `Cancel` and `Save`, Save disabled until dirty
export function PlaceForm({ place, onSubmit, onCancel }: PlaceFormProps) {
  const { schema, Fields } = getPlaceTypeModule(place.type)
  const form = useForm<AnyPlace>({ resolver: zodResolver(schema as never), defaultValues: place, mode: 'onTouched' })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-3'>
        <Fields />
        <Actions form={form} onCancel={onCancel} />
      </form>
    </FormProvider>
  )
}

function Actions({ form, onCancel }: { form: UseFormReturn<AnyPlace>; onCancel: () => void }) {
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
