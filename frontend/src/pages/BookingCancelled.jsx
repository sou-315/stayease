import { useSearchParams, Link } from 'react-router-dom'
import './BookingResult.css'

function BookingCancelled() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('bookingId')

  return (
    <main className="booking-result-page">
      <div className="booking-result-card cancelled">
        <h1>❌ Payment Cancelled</h1>
        <p>Your payment wasn't completed. Your booking is still saved as pending — you can try paying again from "My Bookings."</p>
        <Link to="/my-bookings">View My Bookings</Link>
      </div>
    </main>
  )
}

export default BookingCancelled