function LoadingState({ message = 'Loading superheroes...', cards = false }) {
  return (
    <div className="loading-state">
      <p className="status" role="status"><span className="loading-spinner" aria-hidden="true" />{message}</p>
      {cards && <div className="skeleton-grid" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <div className="skeleton-card" key={index}><div /><span /><span /></div>)}</div>}
    </div>
  )
}

export default LoadingState
