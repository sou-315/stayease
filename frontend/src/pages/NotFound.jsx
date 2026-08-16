import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h1>404 — Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Back to Home</Link>
    </main>
  )
}

export default NotFound