import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AdminDashboard.css'

function AdminDashboard() {
  const { token } = useAuth()
  const [hotelCount, setHotelCount] = useState(null)
  const [bookingCount, setBookingCount] = useState(null)

  useEffect(() => {
    fetch('http://localhost/stayease-api/hotels.php')
      .then((res) => res.json())
      .then((data) => setHotelCount(data.length))

    fetch('http://localhost/stayease-api/bookings.php?all=true', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBookingCount(data.length))
  }, [token])

  return (
    <main className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p className="admin-subtitle">Manage hotels, rooms, and bookings.</p>

      <div className="admin-stats">
        <div className="admin-stat-box">
          <span className="admin-stat-number">{hotelCount ?? '—'}</span>
          <span className="admin-stat-label">Hotels</span>
        </div>
        <div className="admin-stat-box">
          <span className="admin-stat-number">{bookingCount ?? '—'}</span>
          <span className="admin-stat-label">Total Bookings</span>
        </div>
      </div>

      <div className="admin-menu">
        <Link to="/admin/hotels" className="admin-card">
          <h2>Hotels</h2>
          <p>Add, edit, or remove hotels and their rooms.</p>
        </Link>

        <Link to="/admin/bookings" className="admin-card">
          <h2>Bookings</h2>
          <p>View all bookings across every user.</p>
        </Link>
      </div>
    </main>
  )
}

export default AdminDashboard