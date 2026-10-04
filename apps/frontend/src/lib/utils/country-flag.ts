// Each letter of an ISO 3166-1 alpha-2 code maps to its regional indicator symbol.
export function getCountryFlag(countryCode: string): string {
  return String.fromCodePoint(...[...countryCode.toUpperCase()].map((char) => 127397 + char.charCodeAt(0)))
}
