import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="notfound">
      <h1>404</h1>
      <p>This page wandered off.</p>
      <Link to="/" className="btn btn--primary">Back home</Link>
    </div>
  )
}
