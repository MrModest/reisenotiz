import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import { router } from '@/routes'
import { SyncProvider } from '@/contexts/sync-context'
import { applyTheme, getStoredTheme, THEME_KEY } from '@/hooks/use-theme'

// index.html applies the stored theme before first paint; this follows a change made in another tab.
window.addEventListener('storage', (event) => {
  if (event.key === THEME_KEY || event.key === null) applyTheme(getStoredTheme())
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SyncProvider>
      <RouterProvider router={router} />
    </SyncProvider>
  </StrictMode>,
)
