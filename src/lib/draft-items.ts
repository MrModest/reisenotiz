import { generateUUID } from "@/types/common/uuid"
import { Flight, Accommodation, TripItem, TripItemType } from "@/types"
import { DateTime, TZ } from "@/lib/datetime"

export function createDraftItem(tripId: string, type: TripItemType): TripItem {
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

const AddressDraft = {
  country: '',
  city: '',
  line: ''
}

function createDraftFlight(base: { id: string; tripId: string; note: string; attachments: never[] }): Flight {
  const localTimezone = TZ.local()
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
        address: AddressDraft,
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
        address: AddressDraft,
        tzone: localTimezone
      },
      time: defaultTime,
      terminal: '',
      gate: ''
    }
  }
}

function createDraftAccommodation(base: { id: string; tripId: string; note: string; attachments: never[] }): Accommodation {
  const now = DateTime.now()
  const defaultTime = now.toZonedInstant()

  return {
    ...base,
    type: 'Accommodation',
    site: {
      name: '',
      kind: 'Hotel',
      address: AddressDraft,
      contact: '',
      tzone: TZ.local()
    },
    reservedOn: undefined,
    guests: 1,
    rooms: 1,
    stayInterval: {
      provided: {
        in: defaultTime,
        out: defaultTime
      }
    }
  }
}
