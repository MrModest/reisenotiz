import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useFormContext } from "react-hook-form"

interface FieldInputProps {
  name: string
  label: string
  className?: string
};

export function FieldInput({ name, label, className }: FieldInputProps) {
  const { register, formState: { errors }, } = useFormContext()

  const error = errors[name]?.message as string | undefined

  return (
    <Field className={cn('gap-0', className)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input className='h-fit px-2 rounded-sm' id={name} {...register(name)} />
      {error && <span className='text-xs font-thin text-foreground'>{error}</span>}
    </Field>
  )
}
