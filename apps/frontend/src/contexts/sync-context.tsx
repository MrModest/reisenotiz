import { Suspense, type ReactNode } from 'react'
import { RepoContext } from '@automerge/react'
import { Loader } from '@/components/ui/loader'
import { repo, rootDocUrl } from './sync-repo'
import { RootDocUrlContext } from './root-doc-context'

interface SyncProviderProps {
  children: ReactNode
}

export function SyncProvider({ children }: SyncProviderProps) {
  return (
    <RepoContext.Provider value={repo}>
      <RootDocUrlContext.Provider value={rootDocUrl}>
        <Suspense fallback={<Loader />}>{children}</Suspense>
      </RootDocUrlContext.Provider>
    </RepoContext.Provider>
  )
}
