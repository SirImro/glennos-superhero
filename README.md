# SuperHero Mini

The finished Week 6 React + Vite project, adapted from `../week6-pokedex-students.md` to use [SuperHero API](https://superheroapi.com/) instead of PokéAPI. The original course materials are unchanged.

## Run locally

Requires Node.js 22.12+ or Node.js 24+ and npm. Dependencies are locked in `package-lock.json`.

```bash
cd superhero-mini
npm install
cp .env.example .env.local
```

On PowerShell, use `Copy-Item .env.example .env.local` instead of `cp` if needed.

1. Visit [superheroapi.com](https://superheroapi.com/) and use its sign-in flow to obtain your own access token.
2. Edit `.env.local`:

   ```dotenv
   VITE_SUPERHERO_API_TOKEN=your_actual_access_token
   ```

3. Start Vite:

   ```bash
   npm run dev
   ```

4. Open the printed URL, normally `http://localhost:5173/superhero-mini/`.

Restart Vite after changing the token. Without a token, the app shows setup instructions and makes no API requests. No borrowed credential or fake production data is included.

**Token visibility:** `.env.local` is ignored by Git, but every `VITE_` variable is embedded in the browser build. Anyone using the deployed site can inspect the token in requests or JavaScript. This matches the guide's static classroom architecture; it does not keep the token secret. For a private production token, use a server-side proxy instead of this static setup. GitHub Pages cannot run that proxy.

## How the guide was adapted

| Week 6 requirement | Implementation |
| --- | --- |
| React + Vite scaffold and StrictMode | `src/main.jsx` retains the generated entry point |
| Fetch a list using state and effects | `SuperheroList.jsx` loads 20 documented character IDs |
| Display image, padded number, and name | `HeroCards.jsx` uses `image.url`, `id`, and `name` |
| Controlled search and empty-input validation | `SearchForm.jsx` trims, lowercases, encodes, and navigates only |
| Detail loading belongs to the routed page | `DetailPage.jsx` looks up an ID or searches a name |
| HashRouter, nested layout, Link, Outlet | `App.jsx` and `Layout.jsx` |
| Parameterized detail route | `#/superhero/:identifier` |
| Character types and base stats | Publisher/alignment and the six SuperHero API powerstats |
| Loading, error, and not-found states | Status messages, retry buttons, and wildcard page |
| Prevent stale requests | Effect cleanup, AbortController, current-request guards, keyed detail content |
| Shared configuration and helpers | `src/config.js`, `src/utils.js`, and `src/api.js` |
| Browser-tab title exercise | Titles follow list, detail, and missing-page states |
| Static deployment | Vite base path and `predeploy`/`deploy` scripts |

### API differences that matter

- SuperHero API requires an access token in each URL. The app uses `https://superheroapi.com/api.php/{token}/{id}`. The documented `/api` endpoint redirects; `/api.php` serves JSON directly with CORS headers for browser requests.
- There is no list/pagination endpoint. `FEATURED_HERO_IDS` contains 20 IDs from the [official character table](https://superheroapi.com/ids.html). The app fetches real records with at most four concurrent requests, maintaining their configured order. Change that list to choose different featured characters.
- Name lookup uses `/search/{name}`. Numeric searches go directly to `/{id}`. The documented ID range is 1 through 731.
- Names are not unique. A unique exact match opens its profile. Duplicate exact matches, or partial matches without an exact match, show a choice of characters. Links always use the stable numeric ID.
- HTTP success is not enough: API errors arrive as `{"response":"error","error":"..."}` too. Both HTTP and API error states are checked.
- Featured portraits are bundled locally, because the API's SuperHeroDB image host currently returns HTTP 403. Other characters use a pinned image catalog, alternate image host, then the original API URL. Missing artwork ends in an accessible placeholder rather than a broken image. All character data still comes from superheroapi.com.
- Powerstats may contain the string `"null"`. Missing values display as `Unknown`, while real zero values remain zero.
- Requests time out after 15 seconds. Navigation cancels requests, and old responses cannot overwrite the current character.

## Files

```text
superhero-mini/
├── .env.example
├── index.html
├── package.json
├── vite.config.js
├── playwright.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api.js
│   ├── config.js
│   ├── utils.js
│   ├── index.css
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── SearchForm.jsx
│   │   ├── SuperheroList.jsx
│   │   ├── HeroCards.jsx
│   │   ├── HeroImage.jsx
│   │   └── SetupNotice.jsx
│   ├── pages/
│   │   ├── ListPage.jsx
│   │   ├── DetailPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── api.test.js
│   ├── utils.test.js
│   └── test/
└── tests/app.spec.js
```

## Verification

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

The current Vite React scaffold uses Oxlint rather than ESLint. `npm run lint` runs the scaffold's React rules.

Unit tests cover response parsing, token setup, search normalization, ambiguous names, validation, HTTP/API/network errors, cancellation, timeouts, concurrency, and formatting.

Browser tests use Playwright with installed Google Chrome. If Chrome is unavailable, install it with `npx playwright install chrome`. The suite starts its own Vite servers on ports 4173 and 4174 and shuts them down afterward. Do not use those ports for another server while running the suite.

Browser tests intercept character API traffic using **test-only fixtures**, never a real token. Bundled local portraits are rendered normally; external image fallbacks are intercepted. They exercise list/detail navigation, refresh, browser Back, search, errors/retry, stale requests, missing images/stats, keyboard access, and mobile layouts. Screenshots go to the ignored `test-results/` folder. Fixture screenshots are not evidence of a live authenticated API response.

### Comic-book theme and artwork

The responsive interface uses a red/black comic-book theme, locally hosted Barlow Condensed headings, an illustrated spotlight banner, portrait-card hover effects, staggered entrances, loading skeletons, and route fades. All motion respects the operating system's reduced-motion preference. The spotlight button scrolls to the roster without interfering with hash routing.

All 20 featured heroes have bundled portraits. Search results can use alternate artwork mappings for 563 characters, then fall back to the API image when needed. Portrait fallback behavior has dedicated unit tests. See `ASSETS.md` for artwork sources and font credits. This remains a fan-made educational project, not an official Marvel or DC website.

To manually test live data after supplying your token:

- Click a list character, refresh its detail URL, and use browser Back.
- Submit an empty search. Search for `BATMAN`, `Superman`, `70`, and a nonexistent name.
- Open `#/nonsense` to test the wildcard page.
- Navigate away while a lookup is loading. The new character must stay visible.
- Test an invalid token and offline mode. Restore the token/connection and retry.

## GitHub Pages deployment

The deployment scripts are ready, but no repository was created, no source was committed or pushed, and no site was published automatically.

1. Create your own GitHub repository and connect this project to its remote. The guide provides the Git initialization and push commands.
2. In `vite.config.js`, make `base` match the repository name. The default is `/superhero-mini/`.
3. Configure the token locally before building. It becomes public in the deployed JavaScript as explained above.
4. Commit and push your source when you are ready.
5. Run:

   ```bash
   npm run deploy
   ```

   `predeploy` builds the app first; `gh-pages` publishes `dist/` to the configured `origin` remote.

6. In GitHub repository Settings > Pages, select deployment from the `gh-pages` branch and its root folder.
7. Test `https://YOUR_USERNAME.github.io/superhero-mini/#/superhero/70`, including a refresh. Hash routing keeps refreshes on the static entry point.

Future source changes require both a source push and another `npm run deploy`, as in the course guide. `npm run preview` serves the local production build without publishing it.
