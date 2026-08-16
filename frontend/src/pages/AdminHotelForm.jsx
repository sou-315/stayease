import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AdminHotels.css'
import { API_URL } from '../config'

function AdminHotelForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const { token } = useAuth()

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [rating, setRating] = useState('')
  const [image, setImage] = useState('')
  const [description, setDescription] = useState('')
  const [amenities, setAmenities] = useState('')
  const [loading, setLoading] = useState(isEditMode)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [rooms, setRooms] = useState([])
  const [newRoomType, setNewRoomType] = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomPrice, setNewRoomPrice] = useState('')

  useEffect(() => {
    if (!isEditMode) return

    fetch(`${API_URL}/hotels.php`)
      .then((res) => res.json())
      .then((data) => {
        setName(data.name)
        setLocation(data.location)
        setPrice(data.price)
        setRating(data.rating)
        setImage(data.image)
        setDescription(data.description)
        setAmenities((data.amenities || []).join(', '))
        setRooms(data.rooms || [])
        setLoading(false)
      })
  }, [id, isEditMode])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const payload = {
      name,
      location,
      price: Number(price),
      rating: Number(rating),
      image,
      description,
      amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
    }

    const url = isEditMode
     ? `${API_URL}/hotels.php?id=${id}`
  : `${API_URL}/hotels.php`

    fetch(url, {
      method: isEditMode ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setSubmitting(false)
        if (!ok) {
          setError(data.error || 'Something went wrong.')
          return
        }
        navigate('/admin/hotels')
      })
      .catch(() => {
        setSubmitting(false)
        setError('Something went wrong. Please try again.')
      })
  }

  const handleAddRoom = (e) => {
    e.preventDefault()
    if (!newRoomType || !newRoomName || !newRoomPrice) return

fetch(`${API_URL}/rooms.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        hotel_id: Number(id),
        room_type: newRoomType,
        name: newRoomName,
        price: Number(newRoomPrice),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRooms([...rooms, { id: data.id, hotel_id: Number(id), room_type: newRoomType, name: newRoomName, price: Number(newRoomPrice) }])
          setNewRoomType('')
          setNewRoomName('')
          setNewRoomPrice('')
        } else {
          alert(data.error || 'Failed to add room.')
        }
      })
  }

  const handleDeleteRoom = (roomId) => {
    if (!window.confirm('Delete this room?')) return

   fetch(`${API_URL}/rooms.php?id=${roomId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRooms(rooms.filter((r) => r.id !== roomId))
        } else {
          alert(data.error || 'Failed to delete room.')
        }
      })
  }

  if (loading) {
    return <p style={{ padding: '2rem' }}>Loading hotel...</p>
  }

  return (
    <main className="admin-hotel-form-page">
      <h1>{isEditMode ? 'Edit Hotel' : 'Add Hotel'}</h1>

      <form className="admin-hotel-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} required />
        </label>

        <label>
          Price per night
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </label>

        <label>
          Rating
          <input type="number" step="0.1" min="0" max="5" value={rating} onChange={(e) => setRating(e.target.value)} required />
        </label>

        <label>
          Image URL
          <input value={image} onChange={(e) => setImage(e.target.value)} />
        </label>

        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>

        <label>
          Amenities (comma-separated)
          <input value={amenities} onChange={(e) => setAmenities(e.target.value)} placeholder="Free WiFi, Pool, Spa" />
        </label>

        {error && <p className="admin-form-error">{error}</p>}

        <button type="submit" className="admin-submit-btn" disabled={submitting}>
          {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Hotel'}
        </button>
      </form>

      {isEditMode && (
        <div className="admin-rooms-section">
          <h2>Rooms</h2>

          <ul className="admin-rooms-list">
            {rooms.map((room) => (
              <li key={room.id}>
                <span>{room.name} ({room.room_type}) — ${room.price}/night</span>
                <button onClick={() => handleDeleteRoom(room.id)}>Delete</button>
              </li>
            ))}
          </ul>

          <form className="admin-add-room-form" onSubmit={handleAddRoom}>
            <input
              placeholder="Type (e.g. standard)"
              value={newRoomType}
              onChange={(e) => setNewRoomType(e.target.value)}
            />
            <input
              placeholder="Room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Price"
              value={newRoomPrice}
              onChange={(e) => setNewRoomPrice(e.target.value)}
            />
            <button type="submit">+ Add Room</button>
          </form>
        </div>
      )}
    </main>
  )
}

export default AdminHotelForm