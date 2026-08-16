import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthForm.css'

function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    fetch(`${API_URL}/hotels.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
.then(({ ok, data }) => {
  setSubmitting(false)
  if (!ok) {
    setError(data.error || 'Signup failed.')
    return
  }
  navigate('/login')
})
      .catch(() => {
        setSubmitting(false)
        setError('Something went wrong. Please try again.')
      })
  }

  return (
    <div className="auth-page">
      <h1>Create an account</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-submit-btn" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}

export default Signup