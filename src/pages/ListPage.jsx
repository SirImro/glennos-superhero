import { useEffect } from 'react'
import SearchForm from '../components/SearchForm.jsx'
import SuperheroList from '../components/SuperheroList.jsx'
import HeroBanner from '../components/HeroBanner.jsx'

function ListPage() {
  useEffect(() => { document.title = 'SuperHero Mini | Character archive' }, [])
  return (
    <>
      <HeroBanner />
      <section className="roster-section" id="featured-characters" aria-labelledby="featured-title">
        <div className="roster-heading">
          <div><p className="eyebrow">THE LINEUP</p><h2 id="featured-title" tabIndex={-1}>Featured <span>characters</span></h2></div>
          <p>Extraordinary powers.<br />Unforgettable stories.</p>
        </div>
        <SearchForm />
        <SuperheroList />
      </section>
    </>
  )
}

export default ListPage
