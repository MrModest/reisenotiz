import { isValidAutomergeUrl, type AutomergeUrl, type Repo } from '@automerge/react'
import { EMPTY_ROOT_DOC, type RootDoc } from './types'

export const ROOT_DOC_KEY = 'reisenotiz-root-doc-url'

/**
 * Creates empty root doc if it doesn't exist and returns its URL.
 * If it does exist, just returns the URL saved in localStorage.
 */
export function ensureRootDocUrl(repo: Repo): AutomergeUrl {
  const stored = localStorage.getItem(ROOT_DOC_KEY)
  if (stored && isValidAutomergeUrl(stored)) return stored
  const handle = repo.create<RootDoc>({ ...EMPTY_ROOT_DOC })
  localStorage.setItem(ROOT_DOC_KEY, handle.url)
  return handle.url
}
