import { Combobox, ComboboxOption } from "@/components/ui/combobox/combobox"
import { Field, FieldLabel } from "@/components/ui/field"

type AirportCode = string

export interface AirportSuggestion {
  code: AirportCode
  name: string
}

export interface AirportSelectorProps {
  suggestions: AirportSuggestion[]
  selected: AirportCode
  onSelect: (code: AirportCode | null) => void
  onCreate: (newSuggestion: AirportSuggestion) => void
}

export function AirportSelector({ suggestions, selected, onSelect, onCreate }: AirportSelectorProps) {
  function handleCreate(option: ComboboxOption) {
    console.log('handleCreate', option)
    onCreate({
      code: option.value,
      name: option.label
    })
  }

  return (
    <Field>
      <FieldLabel>Airport</FieldLabel>
      <div className='space-y-4'>
        <Combobox
          options={suggestions.map(a => ({value: a.code, label: a.name}))}
          placeholder='Select an airport...'
          selected={selected}
          onSelect={(option) => onSelect(option.value)}
          onCreate={handleCreate}
        />
      </div>
    </Field>
  )
}
