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
  action: HeaderAction | undefined
) {
  const { setAction } = useHeader()

  useEffect(() => {
    setAction(action)

    return () => {
      setAction(undefined)
    }
  }, [action, setAction])
}
