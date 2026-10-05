import { Link } from 'react-router-dom'
import HeroImage from './HeroImage.jsx'

const coverHeroes = [
  { id: 620, name: 'Spider-Man', caption: 'The friendly neighborhood legend' },
  { id: 346, name: 'Iron Man', caption: 'Genius. Inventor. Avenger.' },
  { id: 659, name: 'Thor', caption: 'The God of Thunder' },
]

function HeroBanner() {
  function explore() {
    const section = document.getElementById('featured-characters')
    section?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
    document.getElementById('featured-title')?.focus({ preventScroll: true })
  }

  return (
    <section className="intro" aria-labelledby="intro-title">
      <div className="intro-copy">
        <p className="eyebrow"><span /> EXTRAORDINARY IS JUST THE BEGINNING</p>
        <h2 id="intro-title">EVERY HERO.<br />EVERY <span>LEGEND.</span></h2>
        <p className="intro-description">Behind the mask. Beyond the myth.<br />Discover the characters that make the impossible, possible.</p>
        <button type="button" className="primary-button" onClick={explore}>Explore the universe <span aria-hidden="true">↗</span></button>
        <p className="intro-footnote">ICONIC CHARACTERS. ONE EXTRAORDINARY ARCHIVE.</p>
      </div>
      <div className="cover-panels" aria-label="Spotlight characters">
        {coverHeroes.map((hero, index) => (
          <Link key={hero.id} to={`/superhero/${hero.id}`} className={`cover-panel cover-panel-${index + 1}`} aria-label={`Discover ${hero.name}`}>
            <HeroImage hero={hero} eager />
            <div className="cover-caption"><span>{hero.caption}</span><strong>{hero.name}</strong></div>
          </Link>
        ))}
        <span className="cover-stamp" aria-hidden="true">THE WORLD<br />NEEDS HEROES.</span>
      </div>
      <div className="intro-bottom"><span>MARVEL / DC / AND BEYOND</span><span>YOUR NEXT ORIGIN STORY STARTS HERE <span aria-hidden="true">↓</span></span></div>
    </section>
  )
}

export default HeroBanner
