import { describe, it, expect, beforeAll } from 'vitest'
import { countryDictionary, countryName } from './dicts'

describe('countryName', () => {
  beforeAll(async () => {
    localStorage.setItem(
      'dict:countries',
      JSON.stringify({ fetchedAt: new Date().toISOString(), data: { DE: { code: 'DE', name: 'Germany' } } }),
    )
    await countryDictionary.load()
    localStorage.clear()
  })

  it('looks up the name of a code', () => {
    expect(countryName('DE')).toBe('Germany')
  })

  it('throws on an unmapped code', () => {
    expect(() => countryName('XX')).toThrow(/XX/)
  })
})
