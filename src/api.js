import {
  API_ACCESS_TOKEN, API_BASE_URL, FEATURED_HERO_IDS, HAS_API_TOKEN, REQUEST_TIMEOUT_MS,
} from './config.js'

async function request(path, { signal } = {}) {
  if (!HAS_API_TOKEN) {
    throw new Error('Add your SuperHero API access token to .env.local, then restart the development server.')
  }
  const controller = new AbortController()
  let timedOut = false
  const abort = () => controller.abort()
  if (signal?.aborted) abort()
  signal?.addEventListener('abort', abort, { once: true })
  const timeout = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(API_ACCESS_TOKEN)}/${path}`, {
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}. Please try again.`)
    }
    let data
    try {
      data = await response.json()
    } catch {
      if (controller.signal.aborted) throw new DOMException('Request aborted', 'AbortError')
      throw new Error('SuperHero API returned an unreadable response. Please try again.')
    }
    // SuperHero API reports application errors inside HTTP 200 responses too.
    if (data?.response !== 'success') {
      const message = String(data?.error ?? '')
      if (/access denied|token|unauthori[sz]ed/i.test(message)) {
        throw new Error('SuperHero API rejected the access token. Check .env.local and restart the development server.')
      }
      if (/not found|invalid id/i.test(message)) {
        throw new Error('No superhero found. Check the name or character ID and try again.')
      }
      throw new Error('SuperHero API could not complete this request. Please try again later.')
    }
    return data
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError')
    if (timedOut) throw new Error('SuperHero API took too long to respond. Please try again.')
    if (error instanceof TypeError) {
      throw new Error('Could not connect to SuperHero API. Check your connection and try again.')
    }
    throw error
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

function validateHero(hero) {
  if (!hero || !/^\d+$/.test(String(hero.id)) || typeof hero.name !== 'string' || !hero.name.trim()) {
    throw new Error('SuperHero API returned incomplete character data. Please try again.')
  }
  return hero
}

export async function fetchSuperhero(id, options) {
  if (!/^\d+$/.test(String(id)) || Number(id) < 1 || Number(id) > 731) {
    throw new Error('Enter a character ID between 1 and 731.')
  }
  return validateHero(await request(String(Number(id)), options))
}

export async function searchSuperheroes(name, options) {
  const query = name.trim().toLowerCase()
  if (!query) throw new Error('Type a superhero name or ID first.')
  const data = await request(`search/${encodeURIComponent(query)}`, options)
  if (!Array.isArray(data.results)) {
    throw new Error('SuperHero API returned incomplete search results. Please try again.')
  }
  if (!data.results.length) {
    throw new Error('No superhero found. Check the name or character ID and try again.')
  }
  const results = data.results.map(validateHero)
  const exactMatches = results.filter((hero) => hero.name.toLowerCase() === query)
  // Several characters share a name. Do not silently pick the wrong variant.
  return exactMatches.length ? exactMatches : results
}

export async function loadCharacter(identifier, options) {
  return /^\d+$/.test(identifier)
    ? [await fetchSuperhero(identifier, options)]
    : searchSuperheroes(identifier, options)
}

export async function loadSuperheroes({ signal } = {}) {
  const heroes = new Array(FEATURED_HERO_IDS.length)
  let nextIndex = 0
  let failed = false
  async function worker() {
    while (!failed && nextIndex < FEATURED_HERO_IDS.length) {
      signal?.throwIfAborted()
      const index = nextIndex++
      try {
        heroes[index] = await fetchSuperhero(FEATURED_HERO_IDS[index], { signal })
      } catch (error) {
        failed = true
        throw error
      }
    }
  }
  // Limit concurrent public API requests while retaining the configured order.
  await Promise.all(Array.from({ length: 4 }, worker))
  return heroes
}
