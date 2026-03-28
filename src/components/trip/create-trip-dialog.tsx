import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { useTripsStore } from '@/store'
import { DateTime, TZ } from '@/lib/datetime'
import { routes } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/trip-item/field-input'
import { FieldTextarea } from '@/components/trip-item/field-textarea'
import { FieldDatePicker } from '@/components/trip-item/field-date-picker'
import { FieldSet } from '@/components/ui/field'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const createTripSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})

type CreateTripSchema = z.infer<typeof createTripSchema>

interface CreateTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function dateStringToZonedInstant(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const zone = TZ.local()
  return DateTime.fromObject({ year, month, day }, zone).toZonedInstant()
}

export function CreateTripDialog({ open, onOpenChange }: CreateTripDialogProps) {
  const createTrip = useTripsStore((state) => state.createTrip)
  const navigate = useNavigate()

  const form = useForm<CreateTripSchema>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset()
    }
  }, [open, form])

  function handleFormSubmit(e: React.FormEvent) {
    e.stopPropagation()
    form.handleSubmit(handleSubmit)(e)
  }

  function handleSubmit(data: CreateTripSchema) {
    const id = createTrip({
      name: data.name,
      description: data.description,
      startDate: dateStringToZonedInstant(data.startDate),
      endDate: dateStringToZonedInstant(data.endDate),
    })
    onOpenChange(false)
    navigate(routes.trips.trip(id))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Trip</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={handleFormSubmit} className='flex flex-col gap-4'>
            <FieldInput name='name' label='Name' required placeholder='Trip name' />
            <FieldTextarea name='description' label='Description' placeholder='Optional description' />
            <FieldSet className='flex-row gap-2'>
              <FieldDatePicker name='startDate' label='Start' required />
              <FieldDatePicker name='endDate' label='End' required />
            </FieldSet>
            <DialogFooter>
              <Button type='submit'>Create</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
