import { joinWith } from '@/lib/utils'
import { countryName } from '@/services'
import type { Address } from '@/types'

export function formatAddress(address: Address): string {
  return joinWith(', ', [address.line, address.city, countryName(address.countryCode)])
}
