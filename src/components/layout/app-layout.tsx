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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop: Side navigation */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-border">
        <Navigation variant="sidebar" />
      </aside>

      {/* Main content area */}
      <main className="flex-1 pb-16 md:pb-0">
        <Header title={title} />
        <Outlet />
      </main>

      {/* Mobile: Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t border-border bg-background">
        <Navigation variant="bottom" />
      </nav>
    </div>
  )
}
