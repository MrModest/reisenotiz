import type { FunctionComponent } from 'react'
import type { IconName } from '@/components/icon'
import type { PlaceSaveError } from '@/store'
import type { Place, PlaceType } from '@/types'

export interface PlaceFormProps<T extends Place> {
  // Absent when adding
  place?: T
  // Returns why the store refused the place, for the form to show
  onSubmit: (place: T) => PlaceSaveError | void
  onCancel: () => void
}

export interface PlaceTypeModule<T extends Place = Place> {
  type: PlaceType
  label: string
  icon: IconName
  Row: FunctionComponent<{ place: T }>
  Form: FunctionComponent<PlaceFormProps<T>>
}
