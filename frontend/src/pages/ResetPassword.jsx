import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import './AuthForm.css'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!token) {
    return (
      <div className="auth-page">
        <h1>Invalid reset link</h1>
        <p>This link is missing required information. Please request a new one.</p>
        <p className="auth-switch">
          <Link to="/forgot-password">Request a new reset link</Link>
        </p>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)

    fetch(`${API_URL}/hotels.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setSubmitting(false)
        if (!ok) {
          setError(data.error || 'Failed to reset password.')
          return
        }
        setMessage(data.message)
        setTimeout(() => navigate('/login'), 2000)
      })
      .catch(() => {
        setSubmitting(false)
        setError('Something went wrong. Please try again.')
      })
  }

  return (
    <div className="auth-page">
      <h1>Set a new password</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          New Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label>
          Confirm New Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        <button type="submit" className="auth-submit-btn" disabled={submitting}>
          {submitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}

export default ResetPassword