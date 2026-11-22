import { describe, it, expect, beforeAll } from 'vitest'
import { countryDictionary } from '@/services'
import type { Airport } from '@/types'
import { placeSuggestions, rankPlaces } from './search'

const airport = (id: string, code: string, name: string, city: string): Airport => ({
  id,
  type: 'Airport',
  code,
  name,
  address: { countryCode: 'DE', city },
  tzone: 'Europe/Berlin',
})

const ber = airport('iata:BER', 'BER', 'Berlin Brandenburg', 'Berlin')
const bre = airport('iata:BRE', 'BRE', 'Bremen', 'Bremen')
const fra = airport('iata:FRA', 'FRA', 'Frankfurt', 'Frankfurt')
const myBer = airport('custom:home', 'BER', 'Home airport', 'Schönefeld')
const airfield = airport('custom:field', 'XBE', 'Berger Feld', 'Kassel')
const brueck = airport('custom:brueck', 'XBK', 'Brück', 'Brück')

describe('place search', () => {
  beforeAll(async () => {
    localStorage.setItem(
      'dict:countries',
      JSON.stringify({ fetchedAt: new Date().toISOString(), data: { DE: { code: 'DE', name: 'Germany' } } }),
    )
    await countryDictionary.load()
    localStorage.clear()
  })

  describe('rankPlaces', () => {
    it('puts a code match before a name match, and leaves out what does not match', () => {
      expect(rankPlaces([fra, airfield, ber], 'be')).toEqual([ber, airfield])
    })

    it('matches nothing for a query shorter than two characters', () => {
      expect(rankPlaces([ber], 'b')).toEqual([])
    })
  })

  describe('placeSuggestions', () => {
    it('keeps the saved places that match and drops the rest', () => {
      expect(placeSuggestions([myBer, airfield], [], 'home')).toEqual([myBer])
    })

    it('keeps every provider result, even one the query does not match locally', () => {
      expect(placeSuggestions([], [ber, fra], 'ber')).toEqual([ber, fra])
    })

    it('shows a saved place and the provider result for the same airport side by side', () => {
      expect(placeSuggestions([myBer], [ber], 'ber')).toEqual([myBer, ber])
    })

    it('ranks saved places and provider results together, with no favour for saved ones', () => {
      // BRE matches on its code, Brück on its name, Berlin Brandenburg inside its name
      expect(placeSuggestions([brueck], [ber, bre], 'br')).toEqual([bre, brueck, ber])
    })
  })
})
