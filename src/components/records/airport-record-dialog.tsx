import { useEffect } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userRecords } from '@/store'
import { airportDictionary } from '@/services'
import { userAirportSchema, type UserAirportSchema } from '@/lib/validations/user-airport'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icon'
import { FieldSet } from '@/components/ui/field'
import { FieldInput } from '@/components/trip-item/field-input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { Airport } from '@/types'

interface AirportRecordDialogProps {
  open: boolean
  onClose: () => void
  airport: Airport | null
  onSave?: (airport: Airport) => void
}

function defaultValues(airport: Airport | null): UserAirportSchema {
  if (!airport) {
    return ({
      code: '',
      name: '',
      address: { country: '', city: '', line: '' },
      tzone: '',
    })
  }

  return ({
    code: airport.code,
    name: airport.name,
    address: airport.address,
    tzone: airport.tzone,
  })
}

export function AirportRecordDialog({ open, onClose, airport, onSave }: AirportRecordDialogProps) {
  const addAirport = userRecords.useAirports((s) => s.addAirport)
  const updateAirport = userRecords.useAirports((s) => s.updateAirport)
  const isEditing = !!airport

  const form = useForm<UserAirportSchema>({
    resolver: zodResolver(userAirportSchema),
    defaultValues: defaultValues(airport),
  })

  useEffect(() => {
    if (open) {
      form.reset(defaultValues(airport))
    }
  }, [open, airport, form])

  const watchedCode = useWatch({ control: form.control, name: 'code' })
  const dictEntry = watchedCode?.length >= 3
    ? airportDictionary.get(watchedCode.toUpperCase())
    : undefined

  function handleSubmit(data: UserAirportSchema) {
    const airportData: Airport = {
      code: data.code,
      name: data.name,
      address: data.address,
      tzone: data.tzone,
    }

    if (isEditing) {
      updateAirport(airport.code, airportData)
    } else {
      addAirport(airportData)
    }
    onSave?.(airportData)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Airport' : 'Add Airport'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your custom airport record.'
              : 'Create a custom airport record for use in flight forms.'}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-4'>
            <FieldSet className='flex-row gap-2'>
              <FieldInput name='code' label='Code' placeholder='IATA' disabled={isEditing} className='w-24 shrink-0' />
              <FieldInput name='name' label='Name' placeholder='Airport name' />
            </FieldSet>

            {!isEditing && dictEntry && (
              <div className='flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs'>
                <Icon name='circle-alert' className='size-4 shrink-0 mt-0.5 text-muted-foreground' />
                <span className='text-muted-foreground'>
                  This will hide the dictionary entry for {dictEntry.code} ({dictEntry.name})
                </span>
              </div>
            )}

            <FieldSet className='gap-1'>
              <FieldInput name='address.line' label='Street, House number' />
              <div className='flex flex-row gap-2'>
                <FieldInput name='address.city' label='City' />
                <FieldInput name='address.country' label='Country' />
              </div>
            </FieldSet>

            <FieldInput name='tzone' label='Timezone' placeholder='e.g. Europe/Berlin' />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit'>
                {isEditing ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
