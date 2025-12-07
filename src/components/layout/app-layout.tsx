import { useState } from 'react'
import { Outlet } from 'react-router'
import { Navigation } from './navigation'
import { Header } from './header'
import { HeaderProvider, useHeader } from '@/contexts/header-context'
import { cn } from '@/lib/utils'

export function AppLayout() {
  return (
    <HeaderProvider>
      <AppLayoutContent />
    </HeaderProvider>
  )
}

function AppLayoutContent() {
  const { title } = useHeader()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Desktop: Side navigation */}
      <aside className={cn(
        "hidden md:flex md:flex-col md:border-r md:border-border md:overflow-y-auto transition-all duration-300",
        isCollapsed ? "md:w-20" : "md:w-64"
      )}>
        <Navigation variant="sidebar" onCollapsedChange={setIsCollapsed} />
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <div className={cn(
          "flex flex-1 justify-center",
          "pb-16 md:pb-0",
          "px-4 pt-2 ",
          "w-full md:w-fit",
          "overflow-y-auto overflow-x-hidden" // vertical scroll only
        )}>
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
