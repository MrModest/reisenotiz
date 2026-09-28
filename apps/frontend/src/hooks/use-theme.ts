import { useState } from 'react'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'theme'

// Light is the default (#37); only an explicit choice turns dark on.
export function getStoredTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState(getStoredTheme)

  function choose(next: Theme) {
    localStorage.setItem(THEME_KEY, next)
    applyTheme(next)
    setTheme(next)
  }

  return [theme, choose]
}
