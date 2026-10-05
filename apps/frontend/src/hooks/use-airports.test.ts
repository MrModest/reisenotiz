import { describe, it, expect } from 'vitest'
import type { Airport } from '@/types'
import { airportCandidates } from './use-airports'

const airport = (code: string, name = code): Airport => ({
  code,
  name,
  address: { countryCode: 'DE', city: 'Berlin' },
  tzone: 'Europe/Berlin',
})

describe('airportCandidates', () => {
  it('offers saved airports before the dictionary, and a saved code only once', () => {
    const candidates = airportCandidates(
      [{ type: 'Airport', key: 'BER', place: airport('BER', 'My BER') }],
      { BER: airport('BER'), MUC: airport('MUC') },
    )
    expect(candidates.map((a) => a.name)).toEqual(['My BER', 'MUC'])
  })

  it('hides an archived airport, its dictionary entry included', () => {
    const candidates = airportCandidates(
      [{ type: 'Airport', key: 'BER', place: { ...airport('BER'), archived: true } }],
      { BER: airport('BER'), MUC: airport('MUC') },
    )
    expect(candidates.map((a) => a.code)).toEqual(['MUC'])
  })
})
