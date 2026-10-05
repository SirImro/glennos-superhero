import { useEffect } from 'react'
import { Link } from 'react-router-dom'

function NotFoundPage() {
  useEffect(() => { document.title = 'Page not found | SuperHero Mini' }, [])
  return (
    <section className="notice not-found">
      <p className="eyebrow">404 / UNCHARTED UNIVERSE</p>
      <h2>There is nothing here.</h2>
      <p>Even superheroes take a wrong turn sometimes.</p>
      <Link to="/" className="back-link">Back to list</Link>
    </section>
  )
}

export default NotFoundPage
