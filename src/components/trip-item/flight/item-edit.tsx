import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Flight } from '@/types'
import { defaultsFromFlight, flightFormSchema, FlightFormSchema } from './edit/formSchema'

interface FlightItemEditProps {
  flight: Flight
  className?: string
}

export function FlightItemEdit({ flight, className }: FlightItemEditProps) {
  const form = useForm<FlightFormSchema>({
    resolver: zodResolver(flightFormSchema),
    defaultValues: defaultsFromFlight(flight),
    mode: 'onTouched'
  })

  function onSubmit(data: FlightFormSchema) {
    console.log(data)
  }

  return (
    <form className={className} onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields go here, using form.register to bind inputs */}
    </form>
  )
}
