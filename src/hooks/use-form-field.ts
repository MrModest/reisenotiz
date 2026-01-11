import { useController, useFormContext } from "react-hook-form"

export function useFormField(fieldName: string) {
  const { control } = useFormContext()
  const { field, fieldState: { error } } = useController({ name: fieldName, control })

  return { field, error }
}
