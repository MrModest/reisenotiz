import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored) return stored as Theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(getInitialTheme())

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [theme])

  return [theme, setTheme]
}
