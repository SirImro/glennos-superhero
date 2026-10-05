import { FEATURED_HERO_IDS } from './config.js'
import heroImages from './hero-images.json'

export function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : ''
}

export function formatId(id) {
  return `#${String(id).padStart(3, '0')}`
}

export function displayValue(value) {
  if (value == null) return 'Unknown'
  const text = String(value).trim()
  return !text || ['null', '-', 'unknown'].includes(text.toLowerCase()) ? 'Unknown' : text
}

export function formatPowerstat(value) {
  const number = Number(displayValue(value))
  return Number.isFinite(number) && number >= 0 && number <= 100 ? String(number) : 'Unknown'
}

export function getImageUrl(hero) {
  try {
    const url = new URL(hero.image?.url)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

export function getImageSources(hero) {
  const sources = []
  const filename = heroImages[hero.id]
  // Bundled portraits avoid the API image host's 403/hotlink restrictions.
  if (FEATURED_HERO_IDS.includes(Number(hero.id))) {
    sources.push(`${import.meta.env.BASE_URL}images/heroes/${Number(hero.id)}.jpg`)
  }
  if (filename) {
    sources.push(`https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/${filename}`)
    sources.push(`https://akabab.github.io/superhero-api/api/images/lg/${filename}`)
  }
  const original = getImageUrl(hero)
  if (original) sources.push(original)
  return [...new Set(sources)]
}
