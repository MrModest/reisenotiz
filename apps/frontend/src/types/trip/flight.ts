import type { ZonedInstant } from '@/types/common'
import { Person } from './person'
import { TripItem } from './trip-item'

export interface FlightPoint {
  // The saved airport's IATA code, which is its key in `savedAirports`
  placeKey: string
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
