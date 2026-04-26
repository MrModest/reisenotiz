import type { StorageKey } from '@automerge/automerge-repo'

export const KEY_SEP = '/'

export function encodeKey(key: StorageKey): string {
  return key.join(KEY_SEP)
}

export function decodeKey(encoded: string): StorageKey {
  return encoded === '' ? [] : encoded.split(KEY_SEP)
}

export interface PrefixMatch {
  exact: string
  likePattern: string
  matchAll: boolean
}

const LIKE_ESCAPE = '\\'

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `${LIKE_ESCAPE}${m}`)
}

export function prefixMatch(prefix: StorageKey): PrefixMatch {
  if (prefix.length === 0) {
    return { exact: '', likePattern: '%', matchAll: true }
  }
  const exact = encodeKey(prefix)
  return {
    exact,
    likePattern: `${escapeLike(exact)}${KEY_SEP}%`,
    matchAll: false,
  }
}

export const LIKE_ESCAPE_CLAUSE = LIKE_ESCAPE
