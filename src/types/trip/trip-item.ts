import { Attachment } from "./attachment"
import { UUID } from "@/types/common/uuid"

const tripItemTypes = [
  'Flight',
  'LongLandTransfer',
  'PublicTransport',
  'Accomodation',
  'POI'
] as const

export type TripItemType = typeof tripItemTypes[number]

export interface TripItem {
  id: UUID;
  tripId: UUID;
  type: TripItemType;
  note: string;
  attachments: Attachment[];
}
