import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { isLoggedIn, authLoading } = useAuth()

  if (authLoading) {
    return <p style={{ padding: '2rem' }}>Loading...</p>
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute