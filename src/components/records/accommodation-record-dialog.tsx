import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userRecords } from '@/store'
import { userAccommodationSchema, type UserAccommodationSchema } from '@/lib/validations/user-accommodation'
import { Button } from '@/components/ui/button'
import { FieldSet } from '@/components/ui/field'
import { FieldInput } from '@/components/trip-item/field-input'
import { FieldSelect } from '@/components/trip-item/field-select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { AccommodationSiteKind } from '@/types'
import type { AccommodationSiteRecord } from '@/store/user-records/accommodations'

const SITE_KIND_OPTIONS: { value: AccommodationSiteKind; label: string }[] = [
  { value: 'Hotel', label: 'Hotel' },
  { value: 'Hostel', label: 'Hostel' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Guesthouse', label: 'Guesthouse' },
  { value: 'BnB', label: 'Bed & Breakfast' },
  { value: 'Resort', label: 'Resort' },
  { value: 'Other', label: 'Other' },
]

interface AccommodationRecordDialogProps {
  open: boolean
  onClose: () => void
  accommodation: AccommodationSiteRecord | null
  onSave?: (accommodation: AccommodationSiteRecord) => void
}

function defaultValues(accommodation: AccommodationSiteRecord | null): UserAccommodationSchema {
  if (!accommodation) {
    return {
      name: '',
      kind: 'Hotel',
      address: { country: '', city: '', line: '' },
      contact: '',
    }
  }
  return {
    name: accommodation.name,
    kind: accommodation.kind,
    address: accommodation.address,
    contact: accommodation.contact || '',
  }
}

export function AccommodationRecordDialog({ open, onClose, accommodation, onSave }: AccommodationRecordDialogProps) {
  const addAccommodation = userRecords.useAccommodations((s) => s.addAccommodation)
  const updateAccommodation = userRecords.useAccommodations((s) => s.updateAccommodation)
  const isEditing = !!accommodation

  const form = useForm<UserAccommodationSchema>({
    resolver: zodResolver(userAccommodationSchema),
    defaultValues: defaultValues(accommodation),
  })

  useEffect(() => {
    if (open) {
      form.reset(defaultValues(accommodation))
    }
  }, [open, accommodation, form])

  function handleFormSubmit(e: React.FormEvent) {
    e.stopPropagation()
    form.handleSubmit(handleSubmit)(e)
  }

  function handleSubmit(data: UserAccommodationSchema) {
    if (isEditing) {
      updateAccommodation(accommodation.id, data)
      onSave?.({ ...data, id: accommodation.id })
    } else {
      const record = addAccommodation(data)
      onSave?.(record)
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Accommodation' : 'Add Accommodation'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your custom accommodation record.'
              : 'Create a custom accommodation record for use in accommodation forms.'}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={handleFormSubmit} className='flex flex-col gap-4'>
            <FieldSet className='flex-row gap-2'>
              <FieldInput name='name' label='Name' placeholder='Accommodation name' />
              <FieldSelect name='kind' label='Type' options={SITE_KIND_OPTIONS} className='w-36' />
            </FieldSet>

            <FieldSet className='gap-1'>
              <FieldInput name='address.line' label='Street, House number' />
              <div className='flex flex-row gap-2'>
                <FieldInput name='address.city' label='City' />
                <FieldInput name='address.country' label='Country' />
              </div>
            </FieldSet>

            <FieldSet>
              <FieldInput name='contact' label='Phone / Contact' />
            </FieldSet>

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
