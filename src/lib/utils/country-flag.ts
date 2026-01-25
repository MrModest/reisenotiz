// Map of country names to ISO 3166-1 alpha-2 codes
const countryCodeMap: Record<string, string> = {
  'Japan': 'JP',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Germany': 'DE',
  'France': 'FR',
  'Italy': 'IT',
  'Spain': 'ES',
  'Canada': 'CA',
  'Australia': 'AU',
  'Netherlands': 'NL',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Belgium': 'BE',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Greece': 'GR',
  'Ireland': 'IE',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Romania': 'RO',
  'Bulgaria': 'BG',
  'Croatia': 'HR',
  'Slovakia': 'SK',
  'Slovenia': 'SI',
  'Estonia': 'EE',
  'Latvia': 'LV',
  'Lithuania': 'LT',
  'Luxembourg': 'LU',
  'Malta': 'MT',
  'Cyprus': 'CY',
}

export function getCountryFlag(countryName: string): string {
  const code = countryCodeMap[countryName] || countryName.slice(0, 2).toUpperCase()

  if (code.length !== 2) return '🌐'

  // Convert country code to flag emoji using regional indicator symbols
  const codePoints = [...code].map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
