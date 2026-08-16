import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './BookingResult.css'
import { API_URL } from '../config'

function BookingSuccess() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const { token } = useAuth()

  const [status, setStatus] = useState('checking') // checking | paid | pending

  useEffect(() => {
    if (!bookingId || !token) return

fetch(`${API_URL}/bookings.php?all=false`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const booking = data.find((b) => b.id === Number(bookingId))
        if (booking && booking.payment_status === 'paid') {
          setStatus('paid')
        } else {
          setStatus('pending')
        }
      })
      .catch(() => setStatus('pending'))
  }, [bookingId, token])

  return (
    <main className="booking-result-page">
      {status === 'checking' && <p>Checking your payment...</p>}

      {status === 'paid' && (
        <div className="booking-result-card success">
          <h1>✅ Payment Successful</h1>
          <p>Your booking is confirmed and paid.</p>
          <Link to="/my-bookings">View My Bookings</Link>
        </div>
      )}

      {status === 'pending' && (
        <div className="booking-result-card pending">
          <h1>⏳ Payment Received</h1>
          <p>We're confirming your payment — this can take a few moments. Check "My Bookings" shortly to confirm the status updated.</p>
          <Link to="/my-bookings">View My Bookings</Link>
        </div>
      )}
    </main>
  )
}

export default BookingSuccess