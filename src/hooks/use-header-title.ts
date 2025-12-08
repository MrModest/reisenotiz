import { useEffect } from 'react'
import { useHeader } from '@/contexts/header-context'
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
