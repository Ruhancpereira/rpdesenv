import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getToken } from '../lib/api'

export function RequireAuth({ children }: { children: ReactNode }) {
  const loc = useLocation()
  if (!getToken()) {
    return <Navigate to="/login" state={{ from: loc }} replace />
  }
  return <>{children}</>
}
