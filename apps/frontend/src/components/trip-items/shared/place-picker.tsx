import { useState } from 'react'
import { get, useFormContext, useFormState, useWatch } from 'react-hook-form'
import { getPlaceTypeModule, placeMeta } from '@/components/places/registry'
import { Button } from '@/components/ui/button'
import { PlaceSelector } from '@/components/ui/combobox/place'
import { Field } from '@/components/ui/field'
import { joinWith } from '@/lib/utils'
import type { AnyPlace, PlaceType } from '@/types'
import { FieldLabel } from './field-label'

interface PlacePickerProps {
  type: PlaceType
  // The form field holding the place itself
  name: string
  label: string
}

// Picking a suggestion copies it into the form; nothing reaches the store until the item is saved.
// The place's fields open beneath it to type a place in or correct the copy. They start open on a
// blank place, close on a pick, and stay open while the place is invalid, so an error is never hidden.
export function PlacePicker({ type, name, label }: PlacePickerProps) {
  const { setValue } = useFormContext()
  const place = useWatch({ name }) as AnyPlace
  const { errors } = useFormState({ name })
  const { empty, Fields } = getPlaceTypeModule(type)
  const blank = !place.name
  const [editing, setEditing] = useState(blank)
  const open = editing || !!get(errors, name)

  function pick(picked: AnyPlace | null) {
    // Clearing the selection starts over with a blank place and no id
    setValue(name, picked ?? empty(), { shouldDirty: true, shouldValidate: !!picked })
    setEditing(!picked)
  }

  return (
    <Field className='gap-1.5'>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <div className='flex items-start gap-2'>
        <div className='min-w-0 flex-1'>
          <PlaceSelector id={name} type={type} selected={place.id ? place : null} onSelect={pick} />
        </div>
        {!blank && (
          <Button type='button' variant='outline' className='h-auto self-stretch px-3 text-sm' onClick={() => setEditing(!open)}>
            {open ? 'Done' : 'Edit'}
          </Button>
        )}
      </div>
      {open ? (
        <div className='flex flex-col gap-3 rounded-lg border border-border p-3'>
          <Fields prefix={`${name}.`} />
        </div>
      ) : (
        <PlacePreview place={place} />
      )}
    </Field>
  )
}

// Spelling the code out is what catches a typo that happens to be another valid code
function PlacePreview({ place }: { place: AnyPlace }) {
  const address = joinWith(', ', [place.address.line, place.address.city])

  return (
    <div className='px-0.5 wrap-anywhere'>
      <p className='text-sm'>{joinWith(' · ', [place.name, placeMeta(place)])}</p>
      <p className='font-mono text-[11px] text-muted-foreground'>{joinWith(' · ', [address, place.tzone])}</p>
    </div>
  )
}
