import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import HeroImage from './components/HeroImage.jsx'
import { getImageSources } from './utils.js'
import { FEATURED_HERO_IDS } from './config.js'

describe('character artwork', () => {
  it('has bundled artwork and alternate sources for every featured hero', () => {
    for (const id of FEATURED_HERO_IDS) {
      const sources = getImageSources({ id })
      expect(sources[0]).toMatch(new RegExp(`/images/heroes/${id}\\.jpg$`))
      expect(sources[1]).toContain('cdn.jsdelivr.net')
      expect(sources[2]).toContain('akabab.github.io')
    }
  })
  it('maps searched characters to their exact image filename', () => {
    const sources = getImageSources({ id: 1, name: 'A-Bomb' })
    expect(sources[0]).toMatch(/\/1-a-bomb.jpg$/)
    expect(sources).toHaveLength(2)
  })
  it('keeps the original image for characters without alternate artwork', () => {
    expect(getImageSources({ id: 9999, image: { url: 'https://example.com/original.jpg' } })).toEqual(['https://example.com/original.jpg'])
    expect(getImageSources({ id: 9999 })).toEqual([])
  })
  it('tries each alternate before showing an accessible placeholder', () => {
    const hero = { id: 70, name: 'Batman', image: { url: 'https://example.com/batman.jpg' } }
    const sources = getImageSources(hero)
    render(<HeroImage hero={hero} />)
    for (const source of sources) {
      const image = screen.getByRole('img', { name: 'Batman', exact: true })
      expect(image).toHaveAttribute('src', source)
      fireEvent.error(image)
    }
    expect(screen.getByRole('img', { name: 'Batman: image unavailable' })).toBeInTheDocument()
  })
  it('resets image failures when the character changes', () => {
    const { rerender } = render(<HeroImage hero={{ id: 9999, name: 'Unknown hero' }} />)
    expect(screen.getByRole('img', { name: 'Unknown hero: image unavailable' })).toBeInTheDocument()
    rerender(<HeroImage hero={{ id: 70, name: 'Batman' }} />)
    expect(screen.getByRole('img', { name: 'Batman', exact: true })).toHaveAttribute('src', expect.stringContaining('/70.jpg'))
  })
})
