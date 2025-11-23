import { Outlet } from 'react-router'
import { Navigation } from './navigation'

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop: Side navigation */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-border">
        <Navigation variant="sidebar" />
      </aside>

      {/* Main content area */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile: Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t border-border bg-background">
        <Navigation variant="bottom" />
      </nav>
    </div>
  )
}
