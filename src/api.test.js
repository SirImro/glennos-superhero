import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeHero } from './test/fixtures.js'

let api
const json = (data) => ({ ok: true, json: async () => data })
beforeEach(async () => {
  vi.resetModules()
  vi.stubEnv('VITE_SUPERHERO_API_TOKEN', 'test-token')
  vi.stubGlobal('fetch', vi.fn())
  api = await import('./api.js')
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('SuperHero API', () => {
  it('uses the direct CORS endpoint', async () => {
    fetch.mockResolvedValue(json(makeHero()))
    expect(await api.fetchSuperhero('070')).toMatchObject({ id: '70', name: 'Batman' })
    expect(fetch).toHaveBeenCalledWith('https://superheroapi.com/api.php/test-token/70', expect.objectContaining({ signal: expect.any(AbortSignal) }))
  })
  it.each(['', 'your_access_token_here'])('does not fetch without a real token: %s', async (token) => {
    vi.stubEnv('VITE_SUPERHERO_API_TOKEN', token)
    vi.resetModules()
    api = await import('./api.js')
    await expect(api.fetchSuperhero(70)).rejects.toThrow('Add your SuperHero API access token')
    expect(fetch).not.toHaveBeenCalled()
  })
  it.each(['0', '732', '-1', 'abc', '70/biography'])('rejects invalid ID %s', async (id) => {
    await expect(api.fetchSuperhero(id)).rejects.toThrow('between 1 and 731')
    expect(fetch).not.toHaveBeenCalled()
  })
  it('normalizes and encodes names, keeping duplicate exact matches', async () => {
    fetch.mockResolvedValue(json({ response: 'success', results: [makeHero(69), makeHero(70), makeHero(71, 'Batman II')] }))
    expect(await api.searchSuperheroes('  BATMAN  ')).toHaveLength(2)
    expect(fetch.mock.calls[0][0]).toMatch(/\/search\/batman$/)
    await api.searchSuperheroes('Captain / Marvel?')
    expect(fetch.mock.calls[1][0]).toMatch(/\/search\/captain%20%2F%20marvel%3F$/)
  })
  it('returns partial matches when no exact match exists', async () => {
    fetch.mockResolvedValue(json({ response: 'success', results: [makeHero(70), makeHero(71, 'Batman II')] }))
    expect(await api.searchSuperheroes('bat')).toHaveLength(2)
  })
  it('routes numeric identifiers to ID lookup', async () => {
    fetch.mockResolvedValue(json(makeHero()))
    expect(await api.loadCharacter('70')).toHaveLength(1)
    expect(fetch.mock.calls[0][0]).toMatch(/\/70$/)
  })
  it('rejects empty search before fetching', async () => {
    await expect(api.searchSuperheroes('  ')).rejects.toThrow('Type a superhero')
    expect(fetch).not.toHaveBeenCalled()
  })
  it.each(['character with given name not found', 'invalid id', 'access denied'])('handles HTTP 200 errors: %s', async (error) => {
    fetch.mockResolvedValue(json({ response: 'error', error }))
    await expect(api.fetchSuperhero(70)).rejects.toThrow(error === 'access denied' ? 'rejected the access token' : 'No superhero found')
  })
  it('handles HTTP failures', async () => {
    fetch.mockResolvedValue({ ok: false, status: 503 })
    await expect(api.fetchSuperhero(70)).rejects.toThrow('status 503')
  })
  it('handles network failures without leaking token URLs', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch test-token'))
    await expect(api.fetchSuperhero(70)).rejects.toThrow('Could not connect')
  })
  it('handles malformed JSON and incomplete data', async () => {
    fetch.mockResolvedValue({ ok: true, json: () => Promise.reject(new SyntaxError()) })
    await expect(api.fetchSuperhero(70)).rejects.toThrow('unreadable response')
    fetch.mockResolvedValue(json({ response: 'success' }))
    await expect(api.fetchSuperhero(70)).rejects.toThrow('incomplete character data')
    await expect(api.searchSuperheroes('batman')).rejects.toThrow('incomplete search results')
    fetch.mockResolvedValue(json({ response: 'success', results: [] }))
    await expect(api.searchSuperheroes('batman')).rejects.toThrow('No superhero found')
  })
  it('aborts requests when a component leaves', async () => {
    fetch.mockImplementation((url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    }))
    const controller = new AbortController()
    const pending = api.fetchSuperhero(70, { signal: controller.signal })
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  })
  it('times out stalled requests', async () => {
    vi.useFakeTimers()
    fetch.mockImplementation((url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    }))
    const pending = expect(api.fetchSuperhero(70)).rejects.toThrow('too long')
    await vi.advanceTimersByTimeAsync(15000)
    await pending
  })
  it('loads twenty records in order with bounded concurrency', async () => {
    let active = 0
    let maximum = 0
    fetch.mockImplementation(async (url) => {
      active++
      maximum = Math.max(maximum, active)
      await new Promise((resolve) => setTimeout(resolve, 1))
      active--
      return json(makeHero(url.split('/').at(-1)))
    })
    const heroes = await api.loadSuperheroes()
    const { FEATURED_HERO_IDS } = await import('./config.js')
    expect(heroes.map((hero) => Number(hero.id))).toEqual(FEATURED_HERO_IDS)
    expect(fetch).toHaveBeenCalledTimes(20)
    expect(maximum).toBeLessThanOrEqual(4)
  })
})
