import type { FunctionComponent } from 'react'
import type { IconName } from '@/components/icon'
import type { Place, PlaceType } from '@/types'

export interface PlaceFormProps<T extends Place> {
  // Absent when adding
  place?: T
  // Keys already saved for this type, which a new place may not take
  takenKeys: string[]
  onSubmit: (place: T) => void
  onCancel: () => void
}

export interface PlaceTypeModule<T extends Place = Place> {
  type: PlaceType
  label: string
  icon: IconName
  Row: FunctionComponent<{ place: T }>
  Form: FunctionComponent<PlaceFormProps<T>>
}
