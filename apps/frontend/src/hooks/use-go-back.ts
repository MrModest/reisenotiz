import { useLocation, useNavigate } from 'react-router'

// Back in history, or to `fallback` when this page was the first one opened — `PageHeader`'s rule
export function useGoBack(fallback: string) {
  const navigate = useNavigate()
  const location = useLocation()
  return () => (location.key === 'default' ? navigate(fallback, { replace: true }) : navigate(-1))
}
