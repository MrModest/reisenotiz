import { useUserAirportsStore } from './airports'
import { useUserAccommodationsStore } from './accommodations'

export const userRecords = {
  useAirports: useUserAirportsStore,
  useAccommodations: useUserAccommodationsStore,
}
