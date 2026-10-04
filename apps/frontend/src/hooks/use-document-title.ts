import { useEffect } from 'react'

// Outer pages only: above 900px a pane's header is mounted beside its page's, and two callers would race.
export function useDocumentTitle(name: string) {
  useEffect(() => {
    document.title = `${name} – Reisenotiz`
  }, [name])
}
