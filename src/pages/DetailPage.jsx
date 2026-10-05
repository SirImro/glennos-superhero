import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadCharacter } from '../api.js'
import { HAS_API_TOKEN, POWERSTAT_NAMES } from '../config.js'
import { capitalize, displayValue, formatId, formatPowerstat } from '../utils.js'
import HeroCards from '../components/HeroCards.jsx'
import HeroImage from '../components/HeroImage.jsx'
import SetupNotice from '../components/SetupNotice.jsx'
import LoadingState from '../components/LoadingState.jsx'

function CharacterDetails({ identifier }) {
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
      setHeroes([])
      try {
        const data = await loadCharacter(identifier, { signal: controller.signal })
        if (isCurrent) setHeroes(data)
      } catch (err) {
        if (isCurrent) setError(err.message)
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }
    load()
    return () => { isCurrent = false; controller.abort() }
  }, [identifier, attempt])

  const hero = heroes.length === 1 ? heroes[0] : null
  useEffect(() => {
    document.title = hero ? `${hero.name} | SuperHero Mini` : 'Character lookup | SuperHero Mini'
  }, [hero])

  if (!HAS_API_TOKEN) return <SetupNotice />
  if (isLoading) return <LoadingState message={`Loading ${identifier}...`} />
  if (error) {
    return (
      <div className="notice">
        <h2>Character unavailable</h2>
        <p className="status-error" role="alert">{error}</p>
        <button className="secondary-button" onClick={() => setAttempt((value) => value + 1)}>Try again</button>
      </div>
    )
  }
  if (!hero) {
    return (
      <section aria-labelledby="matches-title">
        <p className="eyebrow">SEARCH RESULTS</p>
        <h2 id="matches-title">Choose your character</h2>
        <p>More than one character matches &quot;{identifier}&quot;. Open a profile below.</p>
        <HeroCards heroes={heroes} />
      </section>
    )
  }

  return (
    <article className="detail-page">
      <div className="profile-heading">
        <HeroImage hero={hero} large />
        <div className="profile-copy">
          <p className="eyebrow">CHARACTER FILE <span className="hero-id">{formatId(hero.id)}</span></p>
          <h2>{hero.name}</h2>
          <p className="real-name">{displayValue(hero.biography?.['full-name'])}</p>
          <div className="tags">
            <span>{displayValue(hero.biography?.publisher)}</span>
            <span>{capitalize(displayValue(hero.biography?.alignment))}</span>
          </div>
          <p className="occupation">{displayValue(hero.work?.occupation)}</p>
        </div>
      </div>
      <section className="profile-section" aria-labelledby="powerstats-title">
        <div className="section-heading">
          <h3 id="powerstats-title">Powerstats</h3>
          <span>API ratings out of 100</span>
        </div>
        <dl className="stat-list">
          {POWERSTAT_NAMES.map((name) => (
            <div key={name}>
              <dt>{capitalize(name)}</dt>
              <dd>{formatPowerstat(hero.powerstats?.[name])}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="profile-section" aria-labelledby="biography-title">
        <h3 id="biography-title">Behind the identity</h3>
        <dl className="biography-list">
          <div><dt>Place of birth</dt><dd>{displayValue(hero.biography?.['place-of-birth'])}</dd></div>
          <div><dt>First appearance</dt><dd>{displayValue(hero.biography?.['first-appearance'])}</dd></div>
          <div><dt>Race</dt><dd>{displayValue(hero.appearance?.race)}</dd></div>
          <div><dt>Affiliation</dt><dd>{displayValue(hero.connections?.['group-affiliation'])}</dd></div>
        </dl>
      </section>
    </article>
  )
}

function DetailPage() {
  const { identifier } = useParams()
  return (
    <>
      <Link to="/" className="back-link">Back to list</Link>
      {/* A new route never briefly renders the previous character. */}
      <CharacterDetails key={identifier} identifier={identifier} />
    </>
  )
}

export default DetailPage
