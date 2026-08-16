import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import './AdminBookings.css'

function AdminBookings() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost/stayease-api/bookings.php?all=true', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setBookings(data)
        setLoading(false)
      })
  }, [token])

  if (loading) {
    return <p style={{ padding: '2rem' }}>Loading bookings...</p>
  }

  if (bookings.length === 0) {
    return (
      <main className="admin-bookings-page">
        <h1>All Bookings</h1>
        <p>No bookings yet.</p>
      </main>
    )
  }

  return (
    <main className="admin-bookings-page">
      <h1>All Bookings</h1>
      <table className="admin-table">
        
      <thead>
  <tr>
    <th>User</th>
    <th>Hotel</th>
    <th>Room</th>
    <th>Check-in</th>
    <th>Check-out</th>
    <th>Guests</th>
    <th>Total</th>
    <th>Payment</th>
  </tr>
</thead>
<tbody>
  {bookings.map((b) => (
    <tr key={b.id}>
      <td>{b.user_name}<br /><span className="admin-table-subtext">{b.user_email}</span></td>
      <td>{b.hotel_name}<br /><span className="admin-table-subtext">{b.location}</span></td>
      <td>{b.room_name}</td>
      <td>{b.check_in}</td>
      <td>{b.check_out}</td>
      <td>{b.guests}</td>
      <td>${b.total}</td>
      <td>
        <span className={`payment-badge ${b.payment_status}`}>
          {b.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
        </span>
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </main>
  )
}

export default AdminBookings