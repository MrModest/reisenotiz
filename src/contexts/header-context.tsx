import { IconName } from '@/components/icon'
import { createContext, useContext, useState, type ReactNode } from 'react'

interface HeaderContextValue {
  title?: string
  setTitle: (title: string | undefined) => void
  icon?: IconName
  setIcon: (icon: IconName | undefined) => void
  actions: HeaderAction[]
  setActions: (action: HeaderAction[]) => void
  showBackButton: boolean
  setShowBackButton: (show: boolean) => void
  onBack?: () => void
  setOnBack: (onBack: (() => void) | undefined) => void
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
  const [actions, setActions] = useState<HeaderAction[]>([])
  const [showBackButton, setShowBackButton] = useState(false)
  const [onBack, setOnBack] = useState<(() => void) | undefined>()

  return (
    <HeaderContext.Provider value={{
      title, setTitle,
      icon, setIcon,
      actions, setActions,
      showBackButton, setShowBackButton,
      onBack, setOnBack
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
