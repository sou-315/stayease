import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthForm.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    fetch('http://localhost/stayease-api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setSubmitting(false)
        if (!ok) {
          setError(data.error || 'Login failed.')
          return
        }
        login(data.user, data.token)
        navigate('/')
      })
      .catch(() => {
        setSubmitting(false)
        setError('Something went wrong. Please try again.')
      })
  }

  return (
    <div className="auth-page">
      <h1>Log in</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
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
          {submitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="auth-switch">
  <Link to="/forgot-password">Forgot your password?</Link>
</p>
<p className="auth-switch">
  Don't have an account? <Link to="/signup">Sign up</Link>
</p>
    </div>
  )
}

export default Login