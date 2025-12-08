import { IconName } from '@/components/icon'
import { createContext, useContext, useState, type ReactNode } from 'react'

interface HeaderContextValue {
  title?: string
  setTitle: (title: string | undefined) => void
  icon?: IconName
  setIcon: (icon: IconName | undefined) => void
  action?: HeaderAction
  setAction: (action: HeaderAction | undefined) => void
}

export interface HeaderAction {
  label?: string
  icon?: IconName
  onClick: () => void
}

const HeaderContext = createContext<HeaderContextValue | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string | undefined>()
  const [icon, setIcon] = useState<IconName | undefined>()
  const [action, setAction] = useState<HeaderAction | undefined>()

  return (
    <HeaderContext.Provider value={{
      title, setTitle,
      icon, setIcon,
      action, setAction
    }}>
      {children}
    </HeaderContext.Provider>
  )
}

export function useHeader() {
  const context = useContext(HeaderContext)
  if (!context) {
    throw new Error('useHeader must be used within HeaderProvider')
  }
  return context
}
