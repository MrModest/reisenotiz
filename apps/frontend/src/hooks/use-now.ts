import { useEffect, useState } from 'react'
import { DateTime } from '@/lib/datetime'

// A restored PWA does not re-render on its own, so `now` is re-read whenever the page is shown again.
export function useNow(): DateTime {
  const [now, setNow] = useState(() => DateTime.now())
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') setNow(DateTime.now())
    }
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [])
  return now
}
