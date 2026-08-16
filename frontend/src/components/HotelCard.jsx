import { Link } from 'react-router-dom'
import './HotelCard.css'

function HotelCard({ hotel }) {
  return (
    <Link to={`/hotels/${hotel.id}`} className="hotel-card-link">
      <div className="hotel-card">
        <img src={hotel.image} alt={hotel.name} className="hotel-card-image" />
        <div className="hotel-card-body">
          <h3>{hotel.name}</h3>
          <p className="hotel-location">{hotel.location}</p>
          <div className="hotel-card-footer">
            <span className="hotel-price">${hotel.price} / night</span>
            <span className="hotel-rating">★ {hotel.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default HotelCard