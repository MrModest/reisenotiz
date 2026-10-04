import { describe, it, expect } from 'vitest'
import { Repo, generateAutomergeUrl } from '@automerge/react'
import { isDocumentUnavailableError } from './document-unavailable'

describe('isDocumentUnavailableError', () => {
  it('recognises the error a repo throws for a document no one has', async () => {
    const repo = new Repo({ network: [] })
    const error = await repo.find(generateAutomergeUrl()).catch((e: unknown) => e)
    expect(isDocumentUnavailableError(error)).toBe(true)
  })

  it('rejects any other error', () => {
    expect(isDocumentUnavailableError(new Error('Trip abc not found'))).toBe(false)
    expect(isDocumentUnavailableError('Document x is unavailable')).toBe(false)
  })
})
