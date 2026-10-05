import { useState } from 'react'
import { getImageSources } from '../utils.js'

function Portrait({ sources, name, large, eager }) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const url = sources[sourceIndex]
  const className = `hero-image ${large ? 'hero-portrait' : 'hero-thumbnail'}`

  if (!url) {
    return (
      <span className={`${className} image-placeholder`} role="img" aria-label={`${name}: image unavailable`}>
        <svg viewBox="0 0 80 96" aria-hidden="true"><path d="M40 4 72 16v31c0 22-32 43-32 43S8 69 8 47V16Z" /><path d="m27 42 9 9 19-21" /></svg>
        <span>Identity classified</span>
      </span>
    )
  }
  return (
    <img className={`${className}${loaded ? ' is-loaded' : ''}`} src={url} alt={name}
      width={480} height={640} decoding="async"
      loading={large || eager ? 'eager' : 'lazy'} referrerPolicy="no-referrer"
      onLoad={() => setLoaded(true)}
      onError={() => { setLoaded(false); setSourceIndex((index) => index + 1) }} />
  )
}

function HeroImage({ hero, large = false, eager = false }) {
  const sources = getImageSources(hero)
  // Remount when the hero or its image changes, resetting failed source state.
  return <Portrait key={`${hero.id}:${sources.join('|')}`} sources={sources} name={hero.name} large={large} eager={eager} />
}

export default HeroImage
