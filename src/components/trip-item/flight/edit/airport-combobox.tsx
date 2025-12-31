import { useState } from 'react'
import { Combobox, ComboboxOptions } from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export interface AirportOption {
  code: string
  name: string
}

interface AirportComboboxProps {
  options: AirportOption[]
  value: AirportOption | null
  onSelect: (value: AirportOption) => void
  onCreate: (value: AirportOption) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function AirportCombobox({
  options: airports,
  value,
  onSelect,
  onCreate,
  placeholder = 'Select airport',
  disabled,
  className,
}: AirportComboboxProps) {
  const [options, setOptions] = useState<ComboboxOptions[]>(
    airports.map((airport) => ({
      value: airport.code,
      label: airport.name
    }))
  )

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [newAirportOption, setNewAirportOption] = useState<AirportOption | null>(null)

  function handleSelect(option: ComboboxOptions) {
    onSelect({
      code: option.value,
      name: option.label
    })
  }

  function handleCreate(label: string) {
    setNewAirportOption({
      code: label.slice(0, 3).toUpperCase(),
      name: label
    })
    setModalOpen(true)
  }

  function handleCreateConfirm() {
    if (!newAirportOption) return

    const newOption: ComboboxOptions = {
      value: newAirportOption.code,
      label: newAirportOption.name
    }

    onCreate(newAirportOption)

    setOptions((prev) => [...prev, newOption])

    onSelect(newAirportOption)

    setModalOpen(false)
    setNewAirportOption(null)
  }

  function handleModalClose(open: boolean) {
    if (!open) {
      setNewAirportOption(null)
    }
    setModalOpen(open)
  }

  return (
    <>
      <Combobox
        options={options}
        placeholder={placeholder}
        selected={value?.code ?? ''}
        disabled={disabled}
        className={className}
        onSelect={handleSelect}
        onCreate={handleCreate}
      />

      <Dialog open={modalOpen} onOpenChange={handleModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Airport</DialogTitle>
            <DialogDescription>
              Enter the details for the new airport.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='airport-code' className='text-right'>
                Code
              </Label>
              <Input
                id='airport-code'
                value={newAirportOption?.code || ''}
                onChange={(e) => setNewAirportOption({
                  code: e.target.value.toUpperCase(),
                  name: newAirportOption?.name || ''
                })}
                className='col-span-3'
                maxLength={4}
                placeholder='e.g. JFK'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='airport-name' className='text-right'>
                Name
              </Label>
              <Input
                id='airport-name'
                value={newAirportOption?.name || ''}
                onChange={(e) => setNewAirportOption({
                  code: newAirportOption?.code || '',
                  name: e.target.value
                })}
                className='col-span-3'
                placeholder='e.g. John F. Kennedy International'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => handleModalClose(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateConfirm}>
              Add Airport
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
