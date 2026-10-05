function SetupNotice() {
  return (
    <section className="notice setup-notice" aria-labelledby="setup-title">
      <p className="eyebrow">ONE-TIME SETUP</p>
      <h3 id="setup-title">Connect your superhero universe</h3>
      <p>SuperHero API needs a personal access token before it can return characters.</p>
      <ol>
        <li>Get your token at <a href="https://superheroapi.com/" target="_blank" rel="noreferrer">superheroapi.com</a>.</li>
        <li>Copy <code>.env.example</code> to <code>.env.local</code> in the project folder.</li>
        <li>Set <code>VITE_SUPERHERO_API_TOKEN</code> to your token, then restart <code>npm run dev</code>.</li>
      </ol>
      <p className="fine-print">This is a browser-only class project. The token is visible in browser requests and built files. Do not use a private production credential.</p>
    </section>
  )
}

export default SetupNotice
