import type { Accommodation } from './accommodation'
import { Attachment } from './attachment'
import type { Flight } from './flight'

export interface TripItemTypes {
  Flight: Flight
  Accommodation: Accommodation
}

export type TripItemType = keyof TripItemTypes

export interface TripItem {
  id: string
  tripId: string
  type: TripItemType
  note: string
  attachments: Attachment[]
}
