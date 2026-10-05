import { describe, expect, it } from 'vitest'
import { capitalize, displayValue, formatId, formatPowerstat, getImageUrl } from './utils.js'

describe('display helpers', () => {
  it('formats IDs and labels without rewriting superhero names', () => {
    expect(formatId(70)).toBe('#070')
    expect(capitalize('intelligence')).toBe('Intelligence')
    expect(capitalize('')).toBe('')
  })
  it.each([null, undefined, '', ' ', '-', 'null', 'Unknown'])('handles missing API values: %s', (value) => {
    expect(displayValue(value)).toBe('Unknown')
    expect(formatPowerstat(value)).toBe('Unknown')
  })
  it('preserves zero and rejects invalid powerstats', () => {
    expect(formatPowerstat('0')).toBe('0')
    expect(formatPowerstat('100')).toBe('100')
    expect(formatPowerstat('101')).toBe('Unknown')
    expect(formatPowerstat('-1')).toBe('Unknown')
    expect(formatPowerstat('NaN')).toBe('Unknown')
  })
  it('accepts web image URLs and rejects missing or unsafe URLs', () => {
    expect(getImageUrl({ image: { url: 'https://example.com/hero.jpg' } })).toBe('https://example.com/hero.jpg')
    expect(getImageUrl({})).toBeNull()
    expect(getImageUrl({ image: { url: 'javascript:alert(1)' } })).toBeNull()
  })
})
