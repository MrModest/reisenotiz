import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import { router } from '@/routes'
import { SyncProvider } from '@/contexts/sync-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SyncProvider>
      <RouterProvider router={router} />
    </SyncProvider>
  </StrictMode>,
)
