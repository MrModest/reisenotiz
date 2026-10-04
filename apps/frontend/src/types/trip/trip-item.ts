import { Attachment } from './attachment'

export type TripItemType = 'Flight' | 'Accommodation'

export interface TripItem {
  id: string
  tripId: string
  type: TripItemType
  note: string
  attachments: Attachment[]
}
