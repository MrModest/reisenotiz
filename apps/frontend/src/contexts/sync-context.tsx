import { type ReactNode } from 'react'
import { RepoContext } from '@automerge/react'
import { repo, rootDocUrl } from './sync-repo'
import { RootDocUrlContext } from './root-doc-context'

interface SyncProviderProps {
  children: ReactNode
}

export function SyncProvider({ children }: SyncProviderProps) {
  return (
    <RepoContext.Provider value={repo}>
      <RootDocUrlContext.Provider value={rootDocUrl}>
        {children}
      </RootDocUrlContext.Provider>
    </RepoContext.Provider>
  )
}
