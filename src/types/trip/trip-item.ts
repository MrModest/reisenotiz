import { Attachment } from "./attachment"

const tripItemTypes = [
  'Flight',
  'LongTransfer',
  'PublicTransport',
  'Accommodation',
  'POI'
] as const

export type TripItemType = typeof tripItemTypes[number]

export interface TripItem {
  id: string;
  tripId: string;
  type: TripItemType;
  note: string;
  attachments: Attachment[];
}
