import { Link, useNavigate } from 'react-router-dom'
import { useBookings } from '../context/BookingsContext'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { bookings } = useBookings()
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav>
      <div className="logo">StayEase</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/hotels">Hotels</Link></li>
        <li>
          <Link to="/my-bookings">
            My Bookings {bookings.length > 0 && <span className="badge">{bookings.length}</span>}
          </Link>
        </li>
        {isLoggedIn ? (
          <>
            {user.role === 'admin' && <li><Link to="/admin">Admin</Link></li>}
            <li><Link to="/profile">Hi, {user.name}</Link></li>
            <li>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  )
}

export default Navbar