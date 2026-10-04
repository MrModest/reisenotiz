import { describe, expect, it } from 'vitest'
import { getTripItemModule } from './registry'

describe('getTripItemModule', () => {
  it('returns the module for a known type', () => {
    expect(getTripItemModule('Accommodation')?.label).toBe('Stay')
  })

  it('returns undefined for a type this build does not know', () => {
    expect(getTripItemModule('LongTransfer')).toBeUndefined()
    expect(getTripItemModule('toString')).toBeUndefined()
  })
})
