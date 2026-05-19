import { createContext, useContext } from 'react'
import { type AutomergeUrl } from '@automerge/react'

export const RootDocUrlContext = createContext<AutomergeUrl | null>(null)

export function useRootDocUrl(): AutomergeUrl {
  const url = useContext(RootDocUrlContext)
  if (!url) throw new Error('useRootDocUrl must be used inside <SyncProvider>')
  return url
}
