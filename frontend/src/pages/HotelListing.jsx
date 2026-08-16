import { useState, useEffect } from 'react'
import HotelCard from '../components/HotelCard'
import FilterBar from '../components/FilterBar'
import './HotelListing.css'

function HotelListing() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [maxPrice, setMaxPrice] = useState(300)
  const [minRating, setMinRating] = useState(0)
  const [locationFilter, setLocationFilter] = useState('All')
  const [sortBy, setSortBy] = useState('none')

  useEffect(() => {
    fetch(`${API_URL}/hotels.php`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch hotels')
        return res.json()
      })
      .then((data) => {
        setHotels(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const locations = ['All', ...new Set(hotels.map((hotel) => hotel.location))]

  const filteredHotels = hotels.filter((hotel) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      hotel.name.toLowerCase().includes(term) ||
      hotel.location.toLowerCase().includes(term)

    const matchesPrice = hotel.price <= maxPrice
    const matchesRating = hotel.rating >= minRating
    const matchesLocation =
      locationFilter === 'All' || hotel.location === locationFilter

    return matchesSearch && matchesPrice && matchesRating && matchesLocation
  })

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    if (sortBy === 'rating-desc') return b.rating - a.rating
    return 0
  })

  if (loading) {
    return <p style={{ padding: '2rem' }}>Loading hotels...</p>
  }

  if (error) {
    return <p style={{ padding: '2rem', color: 'red' }}>Error: {error}</p>
  }

  return (
    <main>
      <h1 style={{ padding: '2rem 2rem 0' }}>All Hotels</h1>

      <FilterBar
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
        minRating={minRating} setMinRating={setMinRating}
        locationFilter={locationFilter} setLocationFilter={setLocationFilter}
        locations={locations}
        sortBy={sortBy} setSortBy={setSortBy}
      />

      <div className="hotel-grid">
        {sortedHotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>

      {sortedHotels.length === 0 && (
        <p className="no-results">No hotels match your search.</p>
      )}
    </main>
  )
}

export default HotelListing