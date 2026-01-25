import { useEffect } from 'react'
import { useHeader, HeaderAction } from '@/contexts/header-context'
import { IconName } from '@/components/icon'

export function useHeaderTitle(
  title: string | undefined,
  icon?: IconName
) {
  const { setTitle, setIcon } = useHeader()

  useEffect(() => {
    setTitle(title)
    setIcon(icon)

    return () => {
      setTitle(undefined)
      setIcon(undefined)
    }
  }, [
    title, setTitle,
    icon, setIcon
  ])
}

export function useHeaderAction(
  actions: HeaderAction[]
) {
  const { setActions } = useHeader()

  useEffect(() => {
    setActions(actions)

    return () => {
      setActions([])
    }
  }, [actions, setActions])
}

export function useHeaderBackButton(
  showBackButton: boolean = false,
  onBack?: () => void
) {
  const { setShowBackButton, setOnBack } = useHeader()

  useEffect(() => {
    setShowBackButton(showBackButton)
    if (onBack) {
      setOnBack(() => onBack)
    } else {
      setOnBack(undefined)
    }

    return () => {
      setShowBackButton(false)
      setOnBack(undefined)
    }
  }, [showBackButton, onBack, setShowBackButton, setOnBack])
}
