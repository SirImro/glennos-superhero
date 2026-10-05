import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SearchForm() {
  const [query, setQuery] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    const identifier = query.trim().toLowerCase()
    if (!identifier) {
      setError('Type a superhero name or ID first.')
      return
    }
    setError(null)
    navigate(`/superhero/${encodeURIComponent(identifier)}`)
  }

  return (
    <div className="search">
      <form onSubmit={handleSubmit} className="search-form">
        <label htmlFor="hero-search">Find a character</label>
        <div className="search-controls">
          <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
          <input id="hero-search" type="search" value={query}
            onChange={(event) => { setQuery(event.target.value); setError(null) }}
            placeholder="Search a hero, a legend, an alter ego..." className="search-input"
            aria-invalid={Boolean(error)} aria-describedby={error ? 'search-error' : 'search-hint'} />
          <button type="submit" className="search-button">Search <span aria-hidden="true">↗</span></button>
        </div>
        <p id="search-hint" className="fine-print">Search by name or character ID. Try Batman, Spider-Man, or 70.</p>
      </form>
      {error && <p id="search-error" className="status-error" role="alert">{error}</p>}
    </div>
  )
}

export default SearchForm
