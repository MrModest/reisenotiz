import { useId, useState } from "react"
import { ComboboxOption } from "./combobox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../dialog"
import { Label } from "../label"
import { Input } from "../input"
import { Button } from "../button"

export interface CreateModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  defaultOption: ComboboxOption | null
  onSave: (option: ComboboxOption) => void
}

export function ComboboxAddItemModal({ open, setOpen, onSave, defaultOption }: CreateModalProps) {
  const [newValue, setNewValue] = useState<string | null>(defaultOption?.value || null)
  const [newLabel, setNewLabel] = useState<string | null>(defaultOption?.label || null)

  const valueInputId = useId()
  const labelInputId = useId()

  function handleModalClose(open: boolean) {
    if (!open) {
      setNewValue(null)
      setNewLabel(null)
    }
    setOpen(open)
  }

  function handleSave() {
    if (!newValue) return

    onSave({
      value: newValue,
      label: newLabel || newValue
    })

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Airport</DialogTitle>
          <DialogDescription>
            Enter the details for the new airport.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor={valueInputId} className='text-right'>
              Code
            </Label>
            <Input
              id={valueInputId}
              value={newValue || ''}
              onChange={(e) => setNewValue(e.target.value)}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor={labelInputId} className='text-right'>
              Name
            </Label>
            <Input
              id={labelInputId}
              value={newLabel || ''}
              onChange={(e) => setNewLabel(e.target.value)}
              className='col-span-3'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => handleModalClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
