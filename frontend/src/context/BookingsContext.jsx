import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const BookingsContext = createContext()

export function BookingsProvider({ children }) {
  const { token, isLoggedIn } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      setBookings([])
      setLoading(false)
      return
    }

    fetch('http://localhost/stayease-api/bookings.php', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setBookings(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [isLoggedIn, token])

  const addBooking = (newBooking) => {
  return fetch('http://localhost/stayease-api/bookings.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(newBooking),
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((data) => {
          throw new Error(data.error || 'Failed to create booking')
        })
      }
      return res.json()
    })
    .then((createData) => {
      return fetch('http://localhost/stayease-api/bookings.php', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setBookings(data)
          return createData.id
        })
    })
}

  const cancelBooking = (id) => {
    return fetch(`http://localhost/stayease-api/bookings.php?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(() => {
        return fetch('http://localhost/stayease-api/bookings.php', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setBookings(data))
      })
  }

  return (
    <BookingsContext.Provider value={{ bookings, addBooking, cancelBooking, loading }}>
      {children}
    </BookingsContext.Provider>
  )
}

export function useBookings() {
  return useContext(BookingsContext)
}