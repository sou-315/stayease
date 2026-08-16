import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import HotelListing from './pages/HotelListing'
import HotelDetails from './pages/HotelDetails'
import NotFound from './pages/NotFound'
import BookingForm from './pages/BookingForm'
import MyBookings from './pages/MyBookings'
import ResetPassword from './pages/ResetPassword'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminHotels from './pages/AdminHotels'
import AdminHotelForm from './pages/AdminHotelForm'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminBookings from './pages/AdminBookings'
import BookingSuccess from './pages/BookingSuccess'
import BookingCancelled from './pages/BookingCancelled'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<HotelListing />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route
          path="/hotels/:id/book"
          element={
            <ProtectedRoute>
              <BookingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/hotels"
          element={
            <AdminRoute>
              <AdminHotels />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/hotels/new"
          element={
            <AdminRoute>
              <AdminHotelForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/hotels/:id/edit"
          element={
            <AdminRoute>
              <AdminHotelForm />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
        <Route
  path="/admin/bookings"
  element={
    <AdminRoute>
      <AdminBookings />
    </AdminRoute>
  }
/>
<Route
  path="/booking-success"
  element={
    <ProtectedRoute>
      <BookingSuccess />
    </ProtectedRoute>
  }
/>
<Route
  path="/booking-cancelled"
  element={
    <ProtectedRoute>
      <BookingCancelled />
    </ProtectedRoute>
  }
/>
<Route path="/forgot-password" element={<ForgotPassword />} />

<Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App