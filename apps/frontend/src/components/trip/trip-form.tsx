import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldInput } from '@/components/trip-items/shared/field-input'
import { FieldTextarea } from '@/components/trip-items/shared/field-textarea'
import { FieldDatePicker } from '@/components/trip-items/shared/field-date-picker'
import { FormActions } from '@/components/trip-items/shared/form-actions'
import { tripFormSchema, type TripFormValues } from './trip-form-schema'

interface TripFormProps {
  defaultValues: TripFormValues
  onSubmit: (values: TripFormValues) => void
  onCancel: () => void
}

export function TripForm({ defaultValues, onSubmit, onCancel }: TripFormProps) {
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues,
    mode: 'onTouched',
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex min-h-0 flex-1 flex-col'>
        <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4'>
          <FieldInput name='name' label='Name' />
          <div className='grid grid-cols-2 gap-3'>
            <FieldDatePicker name='startDate' label='Start date' />
            <FieldDatePicker name='endDate' label='End date' />
          </div>
          <FieldTextarea name='description' label='Description' />
        </div>
        <FormActions onCancel={onCancel} />
      </form>
    </FormProvider>
  )
}
