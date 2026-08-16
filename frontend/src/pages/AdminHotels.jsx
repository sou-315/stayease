import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AdminHotels.css'
import { API_URL } from '../config'

function AdminHotels() {
  const { token } = useAuth()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)

  const loadHotels = () => {
    setLoading(true)
    fetch(`${API_URL}/hotels.php`)
      .then((res) => res.json())
      .then((data) => {
        setHotels(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadHotels()
  }, [])

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return

   fetch(`${API_URL}/hotels.php?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          loadHotels()
        } else {
          alert(data.error || 'Failed to delete hotel.')
        }
      })
  }

  if (loading) {
    return <p style={{ padding: '2rem' }}>Loading hotels...</p>
  }

  if (hotels.length === 0) {
    return (
      <main className="admin-hotels-page">
        <div className="admin-hotels-header">
          <h1>Manage Hotels</h1>
          <Link to="/admin/hotels/new" className="admin-add-btn">+ Add Hotel</Link>
        </div>
        <p style={{ marginTop: '24px' }}>No hotels yet. Add your first one above.</p>
      </main>
    )
  }

  return (
    <main className="admin-hotels-page">
      <div className="admin-hotels-header">
        <h1>Manage Hotels</h1>
        <Link to="/admin/hotels/new" className="admin-add-btn">+ Add Hotel</Link>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Price</th>
            <th>Rating</th>
            <th>Rooms</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {hotels.map((hotel) => (
            <tr key={hotel.id}>
              <td>{hotel.name}</td>
              <td>{hotel.location}</td>
              <td>${hotel.price}</td>
              <td>★ {hotel.rating}</td>
              <td>{hotel.rooms.length}</td>
              <td className="admin-table-actions">
                <Link to={`/admin/hotels/${hotel.id}/edit`}>Edit</Link>
                <button onClick={() => handleDelete(hotel.id, hotel.name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

export default AdminHotels