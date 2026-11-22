import type { ZonedInstant } from '@/types/common'
import type { Airport } from './place'
import { Person } from './person'
import { TripItem } from './trip-item'

export interface FlightPoint {
  place: Airport
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
