import { useController, useFormContext } from 'react-hook-form'

export interface FormFieldState {
  field: ReturnType<typeof useController>['field']
  error: ReturnType<typeof useController>['fieldState']['error']

  /**
   * Indicates whether the field has been modified since it was initialized or since the last reset.
   */
  isDirty: ReturnType<typeof useController>['fieldState']['isDirty']
}

export function useFormField(fieldName: string): FormFieldState {
  const { control } = useFormContext()
  const {
    field,
    fieldState: { error, isDirty },
  } = useController({ name: fieldName, control })

  return { field, error, isDirty }
}
