import { Link } from 'react-router-dom'
import { useBookings } from '../context/BookingsContext'
import './MyBookings.css'

function MyBookings() {
  const { bookings, cancelBooking } = useBookings()

  if (bookings.length === 0) {
    return (
      <main className="my-bookings-page">
        <h1>My Bookings</h1>
        <p>You have no bookings yet.</p>
        <Link to="/hotels">Browse hotels</Link>
      </main>
    )
  }

  return (
    <main className="my-bookings-page">
      <h1>My Bookings</h1>
      <div className="bookings-list">
        {bookings.map((b) => (
     <div className="booking-card" key={b.id}>
  <div className="booking-card-header">
    <h3>{b.hotel_name}</h3>
    <span className={`payment-badge ${b.payment_status}`}>
      {b.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
    </span>
  </div>
  <p>{b.location}</p>
  <p>{b.room_name}</p>
  <p>{b.check_in} → {b.check_out}</p>
  <p>{b.guests} guest{b.guests > 1 ? 's' : ''}</p>
  <p className="total">Total: ${b.total}</p>
  <button className="cancel-btn" onClick={() => cancelBooking(b.id)}>
    Cancel Booking
  </button>
</div>
        ))}
      </div>
    </main>
  )
}

export default MyBookings