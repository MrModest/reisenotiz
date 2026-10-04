import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSavedPlace, useSavedPlaceMutations, useSavedPlaces } from '@/store'
import type { PlaceType, PlaceTypes } from '@/types'
import { getPlaceTypeModule } from './registry'

interface PlaceDialogProps<T extends PlaceType> {
  type: T
  // Absent to add a place, present to edit the one saved under it
  placeKey?: string
  onSaved?: (placeKey: string, place: PlaceTypes[T]) => void
  onClose: () => void
}

// One dialog for the Places screen and the trip item forms alike; it never learns who opened it.
export function PlaceDialog<T extends PlaceType>({ type, placeKey, onSaved, onClose }: PlaceDialogProps<T>) {
  const { label, Form } = getPlaceTypeModule(type)
  const entry = useSavedPlace(placeKey)
  const takenKeys = useSavedPlaces().flatMap((e) => (e.type === type ? [e.key] : []))
  const { add, update } = useSavedPlaceMutations()

  if (placeKey && !entry) return null

  const { archived, ...place } = (entry?.place ?? {}) as PlaceTypes[T] & { archived?: boolean }

  function handleSubmit(saved: PlaceTypes[T]) {
    let key = placeKey
    if (key) update(type, key, saved)
    else key = add(type, saved)
    onSaved?.(key, saved)
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {placeKey ? 'Edit' : 'New'} {label.toLowerCase()}
          </DialogTitle>
        </DialogHeader>
        <Form place={entry ? (place as PlaceTypes[T]) : undefined} takenKeys={takenKeys} onSubmit={handleSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  )
}
