import { useState } from 'react'
import { Link } from 'react-router-dom'
import './AuthForm.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    fetch(`${API_URL}/hotels.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSubmitting(false)
        if (data.success) {
          setMessage(data.message)
        } else {
          setError(data.error || 'Something went wrong.')
        }
      })
      .catch(() => {
        setSubmitting(false)
        setError('Something went wrong. Please try again.')
      })
  }

  return (
    <div className="auth-page">
      <h1>Forgot your password?</h1>
      <p>Enter your email and we'll send you a link to reset it.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-submit-btn" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="auth-switch">
        Remember your password? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}

export default ForgotPassword