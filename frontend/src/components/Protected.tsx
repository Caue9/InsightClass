import { Navigate } from 'react-router-dom'
import { useAuth, Role } from '../context/AuthContext'

export default function Protected({
  children,
  allow,
}: {
  children: React.ReactNode
  allow: Role[]
}) {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  if (!allow.includes(session.role)) return <Navigate to="/login" replace />
  return <>{children}</>
}
