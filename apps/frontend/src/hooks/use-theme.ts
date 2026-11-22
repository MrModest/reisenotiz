import { useState } from 'react'

export type Theme = 'system' | 'light' | 'dark'

export const THEME_KEY = 'theme'

// System is the default: no stored value. Only an explicit Light or Dark is stored.
export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

// The inline script in index.html does the same before first paint; keep the two in step.
export function applyTheme(theme: Theme) {
  document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')!.content = theme === 'system' ? 'light dark' : theme
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const scheme = meta.dataset.scheme
    meta.media = theme === 'system' ? `(prefers-color-scheme: ${scheme})` : scheme === theme ? 'all' : 'not all'
  }
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState(getStoredTheme)

  function choose(next: Theme) {
    if (next === 'system') localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, next)
    applyTheme(next)
    setTheme(next)
  }

  return [theme, choose]
}
