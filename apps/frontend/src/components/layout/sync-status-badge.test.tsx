import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Repo, RepoContext, MessageChannelNetworkAdapter } from '@automerge/react'
import { SyncStatusBadge } from './sync-status-badge'

function renderBadge(repo: Repo, variant: 'header' | 'rail') {
  render(
    <RepoContext.Provider value={repo}>
      <SyncStatusBadge variant={variant} />
    </RepoContext.Provider>,
  )
  return screen.getByRole('status')
}

const offlineRepo = () => new Repo({ network: [new MessageChannelNetworkAdapter(new MessageChannel().port1)] })

describe('SyncStatusBadge', () => {
  afterEach(cleanup)

  it('explains a missing sync server on the rail only', () => {
    expect(renderBadge(new Repo({ network: [] }), 'rail').textContent).toBe('Local onlyNo sync server set up')
    cleanup()
    expect(renderBadge(new Repo({ network: [] }), 'header').textContent).toBe('Local only')
  })

  it('explains offline on the rail only', () => {
    expect(renderBadge(offlineRepo(), 'rail').textContent).toBe('OfflineChanges sync when online')
    cleanup()
    expect(renderBadge(offlineRepo(), 'header').textContent).toBe('Offline')
  })
})
