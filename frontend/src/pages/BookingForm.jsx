import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBookings } from '../context/BookingsContext'
import { useAuth } from '../context/AuthContext'
import BookingConfirmation from '../components/BookingConfirmation'
import './BookingForm.css'
import { calculateNights, calculateTotal } from '../utils/bookingCalculations'
import { API_URL } from '../config'

function BookingForm() {
  const { id } = useParams()
  const { addBooking } = useBookings()
  const { token } = useAuth()

  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(`${API_URL}/hotels.php?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Hotel not found')
        return res.json()
      })
      .then((data) => {
        setHotel(data)
        if (data.rooms && data.rooms.length > 0) {
          setSelectedRoomId(data.rooms[0].id)
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <p style={{ padding: '2rem' }}>Loading hotel...</p>
  }

  if (error || !hotel) {
    return <p style={{ padding: '2rem' }}>Hotel not found.</p>
  }

  const selectedRoom = hotel.rooms.find((r) => r.id === Number(selectedRoomId))

  // Calculate nights + total price
const nights = calculateNights(checkIn, checkOut)
const total = selectedRoom ? calculateTotal(nights, selectedRoom.price) : 0

  const validate = () => {
    const newErrors = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (!checkIn) {
      newErrors.checkIn = 'Check-in date is required.'
    } else if (new Date(checkIn) < today) {
      newErrors.checkIn = 'Check-in date cannot be in the past.'
    }

    if (!checkOut) {
      newErrors.checkOut = 'Check-out date is required.'
    } else if (checkIn && new Date(checkOut) <= new Date(checkIn)) {
      newErrors.checkOut = 'Check-out must be after check-in.'
    }

    if (!guests || guests < 1) {
      newErrors.guests = 'At least 1 guest is required.'
    }

    if (!selectedRoomId) {
      newErrors.room = 'Please select a room.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const isValid = validate()

    if (isValid) {
      const newBooking = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        location: hotel.location,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        checkIn,
        checkOut,
        guests,
        nights,
        total,
      }

      addBooking(newBooking)
        .then((bookingId) => {
        return fetch(`${API_URL}/create_checkout.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ bookingId }),
          })
        })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            window.location.href = data.checkout_url
          } else {
            setErrors({ room: data.error || 'Could not start payment.' })
          }
        })
        .catch((err) => {
          setSubmitted(false)
          setErrors({ room: err.message })
        })
    } else {
      setSubmitted(false)
    }
  }

  return (
    <div className="booking-form-page">
      <h1>Book {hotel.name}</h1>
      <p>{hotel.location}</p>

      <form className="booking-form" onSubmit={handleSubmit}>
        <label>
          Room
          <select
            value={selectedRoomId}
            onChange={(e) => {
              setSelectedRoomId(e.target.value)
              setSubmitted(false)
            }}
          >
            {hotel.rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} — ${room.price} / night
              </option>
            ))}
          </select>
          {errors.room && <span className="error">{errors.room}</span>}
        </label>

        <label>
          Check-in
          <input
            type="date"
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value)
              setSubmitted(false)
            }}
          />
          {errors.checkIn && <span className="error">{errors.checkIn}</span>}
        </label>

        <label>
          Check-out
          <input
            type="date"
            value={checkOut}
            onChange={(e) => {
              setCheckOut(e.target.value)
              setSubmitted(false)
            }}
          />
          {errors.checkOut && <span className="error">{errors.checkOut}</span>}
        </label>

        <label>
          Guests
          <input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => {
              setGuests(Number(e.target.value))
              setSubmitted(false)
            }}
          />
          {errors.guests && <span className="error">{errors.guests}</span>}
        </label>

        {nights > 0 && selectedRoom && (
          <div className="booking-summary">
            <p>{nights} night{nights > 1 ? 's' : ''} × ${selectedRoom.price} / night ({selectedRoom.name})</p>
            <p className="total">Total: ${total}</p>
          </div>
        )}

        <button type="submit" className="submit-btn">Confirm Booking</button>
      </form>

      {submitted && (
        <BookingConfirmation
          hotel={hotel}
          room={selectedRoom}
          checkIn={checkIn}
          checkOut={checkOut}
          nights={nights}
          guests={guests}
          total={total}
        />
      )}

      <Link to={`/hotels/${hotel.id}`}>← Back to hotel</Link>
    </div>
  )
}

export default BookingForm