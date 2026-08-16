import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminRoute({ children }) {
  const { isLoggedIn, authLoading, user } = useAuth()

  if (authLoading) {
    return <p style={{ padding: '2rem' }}>Loading...</p>
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute