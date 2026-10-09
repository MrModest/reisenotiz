import { countryName } from '@/services'
import type { Address } from '@/types'

export function formatAddress(address: Address): string {
  return [address.line, address.city, countryName(address.countryCode)].filter(Boolean).join(', ')
}
