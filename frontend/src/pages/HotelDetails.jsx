import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import './HotelDetails.css'

function HotelDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(`http://localhost/stayease-api/hotels.php?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Hotel not found')
        return res.json()
      })
      .then((data) => {
        setHotel(data)
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
    return (
      <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h1>Hotel Not Found</h1>
        <p>We couldn't find a hotel with that ID.</p>
        <Link to="/hotels">Back to all hotels</Link>
      </main>
    )
  }

  return (
    <main className="hotel-details">
      <img src={hotel.image} alt={hotel.name} className="hotel-details-image" />
      <div className="hotel-details-body">
        <h1>{hotel.name}</h1>
        <p className="hotel-location">{hotel.location}</p>
        <div className="hotel-details-meta">
          <span className="hotel-price">${hotel.price} / night</span>
          <span className="hotel-rating">★ {hotel.rating}</span>
        </div>
        {hotel.description && <p className="hotel-description">{hotel.description}</p>}
        <button
          className="book-now-btn"
          onClick={() => navigate(`/hotels/${hotel.id}/book`)}
        >
          Book Now
        </button>
      </div>
    </main>
  )
}

export default HotelDetails