import { generateUUID } from "@/types/common/uuid"
import { Flight, Accommodation, TripItem, TripItemType, UUID } from "@/types"
import { DateTime } from "@/lib/datetime"
import { AddressNone } from "@/types/trip/address"

export function createDraftItem(tripId: UUID, type: TripItemType): TripItem {
  const base = {
    id: generateUUID(),
    tripId,
    note: '',
    attachments: []
  }

  switch (type) {
    case 'Flight':
      return createDraftFlight(base)
    case 'Accommodation':
      return createDraftAccommodation(base)
    case 'LongLandTransfer':
    case 'PublicTransport':
    case 'POI':
      return { ...base, type } as TripItem
    default:
      throw new Error(`Unsupported trip item type: ${type}`)
  }
}

function createDraftFlight(base: { id: UUID; tripId: UUID; note: string; attachments: never[] }): Flight {
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const now = DateTime.now(localTimezone)
  const defaultTime = now.toZonedInstant()

  return {
    ...base,
    type: 'Flight',
    flightNumber: '',
    carrier: '',
    bookingCode: '',
    seat: '',
    passengers: [],
    departure: {
      airport: {
        code: '',
        name: '',
        address: AddressNone,
        tzone: localTimezone
      },
      time: defaultTime,
      terminal: '',
      gate: ''
    },
    arrival: {
      airport: {
        code: '',
        name: '',
        address: AddressNone,
        tzone: localTimezone
      },
      time: defaultTime,
      terminal: '',
      gate: ''
    }
  }
}

function createDraftAccommodation(base: { id: UUID; tripId: UUID; note: string; attachments: never[] }): Accommodation {
  const now = DateTime.now()
  const defaultTime = now.toZonedInstant()

  return {
    ...base,
    type: 'Accommodation',
    site: {
      name: '',
      kind: 'Hotel',
      address: AddressNone
    },
    contact: '',
    reservedOn: '',
    guests: 1,
    rooms: 1,
    reservation: {
      checkIn: {
        available: defaultTime
      },
      checkOut: {
        available: defaultTime
      }
    }
  }
}
