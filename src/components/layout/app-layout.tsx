import { Outlet } from 'react-router'
import { Navigation } from './navigation'
import { Header } from './header'
import { HeaderProvider, useHeader } from '@/contexts/header-context'

export function AppLayout() {
  return (
    <HeaderProvider>
      <AppLayoutContent />
    </HeaderProvider>
  )
}

function AppLayoutContent() {
  const { title } = useHeader()

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Desktop: Side navigation */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-border md:overflow-y-auto">
        <Navigation variant="sidebar" />
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-16 md:pb-0 px-4 md:px-0">
          <Outlet />
        </div>
      </main>

      {/* Mobile: Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t border-border bg-background z-50">
        <Navigation variant="bottom" />
      </nav>
    </div>
  )
}
