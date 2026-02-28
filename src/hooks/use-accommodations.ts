import { useMemo } from 'react'
import { userRecords } from '@/store'
import type { AccommodationSiteRecord } from '@/store/user-records/accommodations'

export function useAccommodations(): AccommodationSiteRecord[] {
  const userAccommodations = userRecords.useAccommodations((s) => s.accommodations)
  return useMemo(() => Object.values(userAccommodations), [userAccommodations])
}
