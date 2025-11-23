import { useEffect } from 'react'
import { useHeader } from '@/contexts/header-context'

export function useHeaderTitle(title: string | undefined) {
  const { setTitle } = useHeader()

  useEffect(() => {
    setTitle(title)

    return () => setTitle(undefined)
  }, [title, setTitle])
}
