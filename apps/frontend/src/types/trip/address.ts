export interface Address {
  // ISO 3166-1 alpha-2
  countryCode: string
  city: string
  line?: string
  geoPoint?: GeoPoint
}

export interface GeoPoint {
  latitude: number
  longitude: number
}
