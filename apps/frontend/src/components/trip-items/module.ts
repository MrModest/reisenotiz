import type { FunctionComponent } from 'react'
import type { IconName } from '@/components/icon'
import type { TimelineElement } from '@/lib/timeline'
import type { TripItem, TripItemType } from '@/types'

export interface TripItemFormProps<T extends TripItem> {
  item: T
  onSubmit: (item: T) => void
  onCancel: () => void
}

export interface TripItemModule<T extends TripItem = TripItem> {
  type: TripItemType
  label: string
  icon: IconName
  createDraft(tripId: string): T
  toTimelineElements(item: T): TimelineElement[]
  View: FunctionComponent<{ item: T }>
  Form: FunctionComponent<TripItemFormProps<T>>
}
