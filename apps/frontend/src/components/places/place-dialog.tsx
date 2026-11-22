import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSavedPlace, useSavedPlaceMutations } from '@/store'
import { customPlaceId, type PlaceType } from '@/types'
import { PlaceForm } from './place-form'
import { getPlaceTypeModule } from './registry'

interface PlaceDialogProps {
  type: PlaceType
  // Absent to add a place, present to edit the one saved under it
  placeId?: string
  onClose: () => void
}

// The Places screen's add and edit. Saving a place deleted on another device meanwhile writes it back.
export function PlaceDialog({ type, placeId, onClose }: PlaceDialogProps) {
  const { label, empty } = getPlaceTypeModule(type)
  const saved = useSavedPlace(placeId)
  const { save } = useSavedPlaceMutations()

  if (placeId && !saved) return null

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {placeId ? 'Edit' : 'New'} {label.toLowerCase()}
          </DialogTitle>
        </DialogHeader>
        <PlaceForm
          place={saved ?? { ...empty(), id: customPlaceId() }}
          onSubmit={(place) => {
            save(place)
            onClose()
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
