import { useFormContext, useFormState, get } from 'react-hook-form'
import { FieldError } from '@/components/ui/field'

/**
 * Read-only error display for a composite field (e.g. airport) that is set via
 * `setValue` rather than a registered input. Uses `useFormState` so it never
 * registers/unregisters the field — important because the field lives inside a
 * collapsible panel that unmounts when collapsed.
 */
export function FieldErrorAt({ name, className }: { name: string; className?: string }) {
  'use no memo'
  // RHF mutates its error object in place (stable reference). The React Compiler
  // would otherwise memoize the derived message against that unchanged reference
  // and skip recomputing when the error clears, so opt out of memoization here.
  const { control } = useFormContext()
  const { errors } = useFormState({ control, name })

  const message = get(errors, name)?.message
  if (!message) {
    return null
  }

  return <FieldError className={className}>{message}</FieldError>
}
