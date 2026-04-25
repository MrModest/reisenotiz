import { useMemo } from 'react'
import { userRecords } from '@/store'
import { airportDictionary } from '@/services'
import type { Airport } from '@/types'

export function useAirports(): Airport[] {
  const userAirports = userRecords.useAirports((s) => s.airports)
  const dictAirports = airportDictionary.getAll()
  return useMemo(() => {
    const merged: Record<string, Airport> = { ...dictAirports, ...userAirports }
    return Object.values(merged)
  }, [dictAirports, userAirports])
}
