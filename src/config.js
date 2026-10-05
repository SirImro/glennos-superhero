// /api redirects; /api.php serves JSON directly with browser CORS headers.
export const API_BASE_URL = 'https://superheroapi.com/api.php'
export const API_ACCESS_TOKEN = (import.meta.env.VITE_SUPERHERO_API_TOKEN ?? '').trim()
export const HAS_API_TOKEN = Boolean(API_ACCESS_TOKEN && API_ACCESS_TOKEN !== 'your_access_token_here')
export const REQUEST_TIMEOUT_MS = 15000

// No list endpoint exists. Fetch these 20 IDs from the official character table.
export const FEATURED_HERO_IDS = [
  70, 644, 720, 620, 346, 149, 659, 332, 263, 38,
  106, 156, 107, 201, 213, 226, 717, 687, 423, 638,
]
export const POWERSTAT_NAMES = [
  'intelligence', 'strength', 'speed', 'durability', 'power', 'combat',
]
