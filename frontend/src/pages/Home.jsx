import './Home.css'
import hotels from '../data/hotels'
import HotelCard from '../components/HotelCard'

function Home() {
  return (
    <main>
      <section className="hero">
        <h1>Find your next stay</h1>
        <p>Search hotels worldwide at the best prices</p>

        <div className="search-bar">
          <input type="text" placeholder="Where are you going?" />
          <input type="date" />
          <input type="date" />
          <input type="number" min="1" placeholder="Guests" />
          <button type="button">Search</button>
        </div>
      </section>

      <section>
        <h2 style={{ padding: '0 2rem', marginTop: '2rem' }}>Featured Hotels</h2>
        <div className="hotel-grid">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home