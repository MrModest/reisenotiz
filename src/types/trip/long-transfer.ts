import { TimelineElement } from "@/components/ui/timeline"
import { Person } from "./person"
import { TripItem } from "./trip-item"
import { ZonedInstant } from "@/lib/datetime"
import { Address } from "./address"
import { routes } from "@/lib/routes"

export interface Station {
  name: string
  address: Address
  tzone: string
}

export interface TransferPoint {
  station: Station
  time: ZonedInstant
}

export type LongTransferKind = 'Bus' | 'Train' | 'Ferry' | 'CarTransfer'

export interface LongTransfer extends TripItem {
  type: 'LongTransfer'
  kind: LongTransferKind
  from: TransferPoint
  to: TransferPoint
  carrier: string
  booking: string
  passengers: Person[]
  seats: string
}

export function getLongTransferTimelineItems(transfer: LongTransfer): TimelineElement[] {
  return [
    {
      id: `{transfer.id}-from`,
      title: `From: ${transfer.from.station.name}`,
      description: `${transfer.kind} from ${transfer.from.station.address.city}`,
      datetime: transfer.from.time,
      link: routes.trips.item(transfer.tripId, transfer.id),
      icon: 'long-transfer',
      status: 'active'
    },
    {
      id: `${transfer.id}-to`,
      title: `To: ${transfer.to.station.name}`,
      description: `${transfer.kind} to ${transfer.to.station.address.city}`,
      datetime: transfer.to.time,
      link: routes.trips.item(transfer.tripId, transfer.id),
      icon: 'long-transfer',
      status: 'active'
    }
  ]
}
