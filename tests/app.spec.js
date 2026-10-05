import { test, expect } from '@playwright/test'
import { makeHero } from '../src/test/fixtures.js'

const names = {
  70: 'Batman', 644: 'Superman', 720: 'Wonder Woman', 620: 'Spider-Man',
  346: 'Iron Man', 149: 'Captain America', 659: 'Thor', 332: 'Hulk',
  263: 'Flash', 38: 'Aquaman', 106: 'Black Panther', 156: 'Captain Marvel',
  107: 'Black Widow', 201: 'Daredevil', 213: 'Deadpool', 226: 'Doctor Strange',
  717: 'Wolverine', 687: 'Venom', 423: 'Magneto', 638: 'Storm',
}

async function mockApi(page) {
  // Character API traffic is mocked; bundled local artwork is served normally.
  await page.route('https://cdn.jsdelivr.net/gh/akabab/**', (route) => route.abort())
  await page.route('https://akabab.github.io/**', (route) => route.abort())
  await page.route('https://images.example.test/**', (route) => route.fulfill({
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="240" height="320" fill="#e8edf5"/><text x="120" y="165" text-anchor="middle" fill="#586c90" font-size="24">Test image</text></svg>',
  }))
  await page.route('https://superheroapi.com/**', (route) => {
    const url = new URL(route.request().url())
    const last = decodeURIComponent(url.pathname.split('/').at(-1))
    if (url.pathname.includes('/search/')) {
      if (last === 'batman') {
        return route.fulfill({ json: { response: 'success', results: [makeHero(69), makeHero(70)] } })
      }
      if (last === 'superman') {
        return route.fulfill({ json: { response: 'success', results: [makeHero(644, 'Superman')] } })
      }
      return route.fulfill({ json: { response: 'error', error: 'character with given name not found' } })
    }
    return route.fulfill({ json: makeHero(last, names[last] ?? 'Test hero') })
  })
}

test('renders the list, opens a character, survives refresh, and returns with browser Back', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await mockApi(page)
  await page.goto('./')
  await expect(page.locator('.hero-link')).toHaveCount(20)
  await expect(page.getByText('#070', { exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('list-fixture.png'), fullPage: true })
  await page.locator('a[href="#/superhero/70"]').click()
  await expect(page.getByRole('heading', { name: 'Batman', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Powerstats' })).toBeVisible()
  await expect(page.locator('.stat-list > div')).toHaveCount(6)
  await expect(page).toHaveTitle('Batman | SuperHero Mini')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Batman', exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('detail-fixture.png'), fullPage: true })
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Featured characters' })).toBeVisible()
  expect(errors).toEqual([])
})

test('validates empty search, normalizes case, and lets users choose duplicate names', async ({ page }) => {
  await mockApi(page)
  await page.goto('./')
  await expect(page.locator('.hero-link')).toHaveCount(20)
  const searches = []
  page.on('request', (request) => {
    if (request.url().includes('/search/')) searches.push(request.url())
  })
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('Type a superhero name or ID first.')
  expect(searches).toHaveLength(0)
  await page.getByLabel('Find a character').fill('  BATMAN  ')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page).toHaveURL(/#\/superhero\/batman$/)
  await expect(page.getByRole('heading', { name: 'Choose your character' })).toBeVisible()
  await expect(page.locator('.hero-link')).toHaveCount(2)
  await page.locator('a[href="#/superhero/70"]').click()
  await expect(page.getByRole('heading', { name: 'Batman', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Back to list' }).click()
  await page.getByLabel('Find a character').fill('70')
  await page.getByLabel('Find a character').press('Enter')
  await expect(page.getByRole('heading', { name: 'Batman', exact: true })).toBeVisible()
})

test('shows not-found search and unknown route states with working home links', async ({ page }) => {
  await mockApi(page)
  await page.goto('./#/superhero/not-a-hero')
  await expect(page.getByRole('alert')).toContainText('No superhero found')
  await page.getByRole('link', { name: 'Back to list' }).click()
  await expect(page.getByLabel('Find a character')).toBeVisible()
  await page.goto('./#/nonsense')
  await expect(page.getByRole('heading', { name: 'There is nothing here.' })).toBeVisible()
  await page.getByRole('link', { name: 'Back to list' }).click()
  await expect(page.getByLabel('Find a character')).toBeVisible()
})

test('shows a loading state, token errors, and retries the list', async ({ page }) => {
  await mockApi(page)
  let fail = true
  await page.route('https://superheroapi.com/**', async (route) => {
    if (!fail) return route.fallback()
    await new Promise((resolve) => setTimeout(resolve, 250))
    return route.fulfill({ json: { response: 'error', error: 'access denied' } })
  })
  await page.goto('./')
  await expect(page.getByRole('status')).toHaveText('Loading superheroes...')
  await expect(page.getByRole('alert')).toContainText('rejected the access token')
  fail = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.locator('.hero-link')).toHaveCount(20)
})

test('keeps the latest character when an older request finishes later', async ({ page }) => {
  await mockApi(page)
  let release
  let started
  const waiting = new Promise((resolve) => { release = resolve })
  const requestStarted = new Promise((resolve) => { started = resolve })
  await page.route('https://superheroapi.com/**/70', async (route) => {
    started()
    await waiting
    await route.fulfill({ json: makeHero() }).catch(() => {})
  })
  await page.goto('./#/superhero/70')
  await requestStarted
  await expect(page.getByRole('status')).toContainText('Loading 70')
  await page.evaluate(() => { window.location.hash = '/superhero/644' })
  await expect(page.getByRole('heading', { name: 'Superman', exact: true })).toBeVisible()
  release()
  await expect(page.getByRole('heading', { name: 'Batman', exact: true })).toHaveCount(0)
  await expect(page).toHaveTitle('Superman | SuperHero Mini')
})

test('handles missing stats and broken images on mobile without overflow', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await mockApi(page)
  await page.route('https://superheroapi.com/**/70', (route) => route.fulfill({
    json: makeHero(70, 'Batman', { powerstats: { intelligence: 'null', strength: '0' }, biography: {} }),
  }))
  await page.route('**/images/heroes/70.jpg', (route) => route.fulfill({ status: 404, body: '' }))
  await page.route('https://images.example.test/**', (route) => route.fulfill({ status: 404, body: '' }))
  await page.goto('./#/superhero/70')
  await expect(page.getByRole('heading', { name: 'Batman', exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Batman: image unavailable' })).toBeVisible()
  await expect(page.locator('.stat-list > div').filter({ hasText: 'Intelligence' })).toContainText('Unknown')
  await expect(page.locator('.stat-list > div').filter({ hasText: 'Strength' })).toContainText('0')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('mobile-detail-fixture.png'), fullPage: true })
})

test('shows setup without a token, sends no API traffic, and supports keyboard navigation', async ({ page }, testInfo) => {
  const requests = []
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('https://superheroapi.com/**', (route) => {
    requests.push(route.request().url())
    return route.abort()
  })
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('http://127.0.0.1:4174/superhero-mini/')
  await expect(page.getByRole('heading', { name: 'Connect your superhero universe' })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await expect(page.getByRole('heading', { name: 'Featured characters' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('setup-mobile.png'), fullPage: true })
  await page.getByLabel('Find a character').fill('Superman')
  await page.getByLabel('Find a character').press('Enter')
  await expect(page.getByRole('heading', { name: 'Connect your superhero universe' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Back to list' })).toBeVisible()
  expect(requests).toEqual([])
  expect(errors).toEqual([])
})

test('renders every featured portrait and spotlight action without leaving the route', async ({ page }) => {
  await mockApi(page)
  await page.goto('./')
  await expect(page.locator('.hero-link')).toHaveCount(20)
  await page.getByRole('button', { name: 'Explore the universe' }).click()
  await expect(page.getByRole('heading', { name: 'Featured characters' })).toBeFocused()
  expect(new URL(page.url()).hash).not.toContain('featured')
  const images = page.locator('.hero-link img')
  await expect(images).toHaveCount(20)
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true)
    await expect(image).toHaveAttribute('src', /\/images\/heroes\/\d+\.jpg$/)
  }
})

test('respects reduced motion and fits narrow screens', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 320, height: 740 })
  await mockApi(page)
  await page.goto('./')
  await expect(page.locator('.hero-link')).toHaveCount(20)
  expect(await page.locator('.cover-panel').first().evaluate((element) => getComputedStyle(element).animationName)).toBe('none')
  expect(await page.locator('.hero-list > li').first().evaluate((element) => getComputedStyle(element).animationName)).toBe('none')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('comic-mobile.png'), fullPage: true })
})
