import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])

  return (
    <div className="app">
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault()
        document.getElementById('main-content')?.focus()
      }}>Skip to content</a>
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="app-title-link" aria-label="SuperHero Mini home">
            <h1>SUPER<span>HERO</span><small>MINI</small></h1>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            <NavLink to="/" end>Characters</NavLink>
            <a href="https://superheroapi.com/" target="_blank" rel="noreferrer">The API <span aria-hidden="true">↗</span></a>
          </nav>
          <span className="edition"><span aria-hidden="true" /> THE COMIC ARCHIVE</span>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}><div className="route-content" key={pathname}><Outlet /></div></main>
      <footer className="app-footer">
        <div className="footer-top"><span className="footer-wordmark">BEYOND <span>ORDINARY.</span></span><Link to="/">Back to the universe <span aria-hidden="true">↗</span></Link></div>
        <div className="footer-bottom"><span>A fan-made character archive. Not affiliated with Marvel or DC.</span><a href="https://superheroapi.com/" target="_blank" rel="noreferrer">Data by SuperHero API</a></div>
      </footer>
    </div>
  )
}

export default Layout
