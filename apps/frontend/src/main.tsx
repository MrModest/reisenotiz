import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import { router } from '@/routes'
import { SyncProvider } from '@/contexts/sync-context'
import { ThemeProvider } from '@/contexts/theme-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <SyncProvider>
        <RouterProvider router={router} />
      </SyncProvider>
    </ThemeProvider>
  </StrictMode>,
)
