import { describe, expect, it } from 'vitest'
import { mapUrl } from './use-map-url'

describe('mapUrl', () => {
  it('opens the platform maps app, and Google Maps anywhere else', () => {
    expect(mapUrl('Nordallee 25, München', 'Mozilla/5.0 (Linux; Android 14)')).toBe('geo:0,0?q=Nordallee%2025%2C%20M%C3%BCnchen')
    expect(mapUrl('Nordallee 25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toBe('maps://?q=Nordallee%2025')
    expect(mapUrl('Nordallee 25', 'Mozilla/5.0 (X11; Linux x86_64)')).toBe('https://www.google.com/maps/search/?api=1&query=Nordallee%2025')
  })
})
