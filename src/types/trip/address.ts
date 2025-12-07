export interface Address {
  country: string,
  city: string,
  line: string,
  geoPoint?: GeoPoint
}

export interface GeoPoint {
  latitude: number,
  longitude: number
}

export const AddressNone: Address = {
  country: 'None',
  city: 'None',
  line: 'None'
}
