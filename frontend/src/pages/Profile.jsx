import { useAuth } from '../context/AuthContext'
import { useBookings } from '../context/BookingsContext'
import './Profile.css'

function Profile() {
  const { user } = useAuth()
  const { bookings } = useBookings()

  return (
    <main className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-card">
        <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-box">
          <span className="stat-number">{bookings.length}</span>
          <span className="stat-label">Active Booking{bookings.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </main>
  )
}

export default Profile