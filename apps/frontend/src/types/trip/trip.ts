import type { ZonedInstant } from '@/types/common'

export interface Trip {
  id: string
  name: string
  description: string
  startDate: ZonedInstant
  endDate: ZonedInstant
}
