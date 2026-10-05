import { formatAddress } from '@/lib/utils/format-address'
import type { Place } from '@/types'

// The one place that sniffs the platform: each opens its own maps app
export function mapUrl(query: string, userAgent: string): string {
  const q = encodeURIComponent(query)
  if (/android/i.test(userAgent)) return `geo:0,0?q=${q}`
  if (/iphone|ipad|ipod/i.test(userAgent)) return `maps://?q=${q}`
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

export function useMapUrl(place: Place): string {
  return mapUrl(`${place.name}, ${formatAddress(place.address)}`, navigator.userAgent)
}
