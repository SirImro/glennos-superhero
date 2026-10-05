import { useEffect, useState } from 'react'
import { loadSuperheroes } from '../api.js'
import { HAS_API_TOKEN } from '../config.js'
import HeroCards from './HeroCards.jsx'
import SetupNotice from './SetupNotice.jsx'
import LoadingState from './LoadingState.jsx'

function SuperheroList() {
  const [heroes, setHeroes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!HAS_API_TOKEN) return
    let isCurrent = true
    const controller = new AbortController()
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await loadSuperheroes({ signal: controller.signal })
        if (isCurrent) setHeroes(data)
      } catch (err) {
        controller.abort()
        if (isCurrent) setError(err.message)
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }
    load()
    return () => { isCurrent = false; controller.abort() }
  }, [attempt])

  if (!HAS_API_TOKEN) return <SetupNotice />
  if (isLoading) return <LoadingState cards />
  if (error) {
    return (
      <div className="notice">
        <p className="status-error" role="alert">Could not load the list: {error}</p>
        <button className="secondary-button" onClick={() => setAttempt((value) => value + 1)}>Try again</button>
      </div>
    )
  }
  return <HeroCards heroes={heroes} />
}

export default SuperheroList
