import { Link } from 'react-router-dom'
import HeroImage from './HeroImage.jsx'
import { displayValue, formatId } from '../utils.js'

function HeroCards({ heroes }) {
  return (
    <ul className="hero-list">
      {heroes.map((hero, index) => (
        <li key={hero.id} style={{ '--card-delay': `${Math.min(index, 7) * 55}ms` }}>
          <Link to={`/superhero/${hero.id}`} className="hero-link">
            <div className="card-artwork">
              <HeroImage hero={hero} eager={index < 4} />
              <span className="hero-id">{formatId(hero.id)}</span>
              <span className="card-open" aria-hidden="true">↗</span>
              <span className="card-caption">Explore character</span>
            </div>
            <div className="hero-card-copy">
              <span className="hero-publisher">{displayValue(hero.biography?.publisher)}</span>
              <span className="hero-name">{hero.name}</span>
              <span className="hero-identity">{displayValue(hero.biography?.['full-name']) === 'Unknown' ? 'Secret identity' : hero.biography['full-name']}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default HeroCards
