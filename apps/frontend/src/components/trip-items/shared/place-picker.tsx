import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldError } from '@/components/ui/field'
import { AirportSelector } from '@/components/ui/combobox/airport'
import { AccommodationSelector, type SavedSiteEntry } from '@/components/ui/combobox/accommodation'
import { PlaceDialog } from '@/components/places/place-dialog'
import { useAirports } from '@/hooks/use-airports'
import { useFormField } from '@/hooks/use-form-field'
import { useSavedPlace, useSavedPlaceMutations, useSavedPlaces, type SavedPlaceEntry } from '@/store'
import type { PlaceType } from '@/types'
import { FieldLabel } from './field-label'

interface PlacePickerProps {
  type: PlaceType
  name: string
  label: string
}

// Picking an entry replaces the link and never edits the place; `Add` / `Edit` opens the place dialog
// from component state, so the half-filled form around it survives
export function PlacePicker({ type, name, label }: PlacePickerProps) {
  const { field, error } = useFormField(name)
  const entry = useSavedPlace(field.value || undefined)
  const linked = entry?.type === type ? entry : undefined
  const [dialogOpen, setDialogOpen] = useState(false)

  function link(key: string) {
    field.onChange(key)
    field.onBlur()
  }

  return (
    <Field className='gap-1.5'>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <div className='flex items-start gap-2'>
        <div className='min-w-0 flex-1'>
          {type === 'Airport' ? (
            <AirportPicker id={name} linked={linked} onPick={link} />
          ) : (
            <SitePicker id={name} linked={linked} onPick={link} />
          )}
        </div>
        <Button type='button' variant='outline' className='h-auto self-stretch px-3 text-sm' onClick={() => setDialogOpen(true)}>
          {linked ? 'Edit' : 'Add'}
        </Button>
      </div>
      {linked ? <PlacePreview entry={linked} /> : field.value && <p className='px-0.5 text-sm text-muted-foreground'>Unknown place</p>}
      {error && <FieldError className='text-xs font-thin'>{error.message}</FieldError>}
      {dialogOpen && (
        <PlaceDialog type={type} placeKey={linked?.key} onSaved={(key) => link(key)} onClose={() => setDialogOpen(false)} />
      )}
    </Field>
  )
}

interface PickerProps {
  id: string
  linked: SavedPlaceEntry | undefined
  onPick: (key: string) => void
}

// Saved and dictionary airports in one list; a dictionary airport is saved before it is linked
function AirportPicker({ id, linked, onPick }: PickerProps) {
  const airports = useAirports()
  const { materialiseAirport } = useSavedPlaceMutations()

  return (
    <AirportSelector
      id={id}
      items={airports}
      selected={linked?.type === 'Airport' ? linked.place : null}
      onSelect={(airport) => onPick(airport ? materialiseAirport(airport) : '')}
    />
  )
}

function SitePicker({ id, linked, onPick }: PickerProps) {
  const sites = useSavedPlaces().filter((e): e is SavedSiteEntry => e.type === 'AccommodationSite' && !e.place.archived)

  return (
    <AccommodationSelector
      id={id}
      items={sites}
      selected={linked?.type === 'AccommodationSite' ? linked : null}
      onSelect={(site) => onPick(site?.key ?? '')}
    />
  )
}

// Spelling the code out is what catches a typo that happens to be another valid code
function PlacePreview({ entry }: { entry: SavedPlaceEntry }) {
  const { place } = entry
  const title = entry.type === 'Airport' ? `${place.name} · ${entry.place.code}` : place.name
  const address = [place.address.line, place.address.city].filter(Boolean).join(', ')

  return (
    <div className='px-0.5 wrap-anywhere'>
      <p className='text-sm'>{title}</p>
      <p className='font-mono text-[11px] text-muted-foreground'>{[address, place.tzone].filter(Boolean).join(' · ')}</p>
    </div>
  )
}
