import type { ZonedInstant } from '@/types/common'
import { Person } from './person'
import { TripItem } from './trip-item'
import { Address } from './address'

export interface Airport {
  code: string
  name: string
  address: Address
  tzone: string
}

export interface FlightPoint {
  airport: Airport
  terminal?: string
  gate?: string
  time: ZonedInstant
}

export interface Flight extends TripItem {
  type: 'Flight'
  flightNumber: string
  carrier: string
  bookingCode: string
  seat: string
  passengers: Person[]
  departure: FlightPoint
  arrival: FlightPoint
}
