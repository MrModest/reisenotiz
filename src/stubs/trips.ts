import { Trip, UUID } from "@/types"

export const trips: Trip[] = [{
  id: 'ffc32db4-d185-41a1-bc30-rcwecwc85b3' as UUID,
  name: 'Trip to Japan',
  startDate: { instant: '2023-04-01T00:00:00.000Z', zone: 'Europe/Berlin' },
  endDate: { instant: '2023-04-15T00:00:00.000Z', zone: 'Europe/Berlin' },
  description: 'Exploring Tokyo, Kyoto, and Osaka.',
}, {
  id: 'abb12db4-d180-41a1-bc30-afa9dccc85b4' as UUID,
  name: 'European Tour',
  startDate: { instant: '2023-06-10T00:00:00.000Z', zone: 'Europe/Berlin' },
  endDate: { instant: '2023-06-30T00:00:00.000Z', zone: 'Europe/Berlin' },
  description: 'Visiting Paris, Rome, and Berlin.',
}]
