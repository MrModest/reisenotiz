import { useLocation, useNavigate } from 'react-router'

// History is right whenever it exists; `fallback` answers "up" only on a cold start from a shared link
export function useGoBack(fallback: string) {
  const navigate = useNavigate()
  const location = useLocation()
  return () => (location.key === 'default' ? navigate(fallback, { replace: true }) : navigate(-1))
}
