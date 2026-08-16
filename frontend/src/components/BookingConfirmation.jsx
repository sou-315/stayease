function BookingConfirmation({ hotel, room, checkIn, checkOut, nights, guests, total }) {
  return (
    <div className="confirmation">
      <h3>✅ Booking Confirmed</h3>
      <ul>
        <li><strong>Hotel:</strong> {hotel.name}</li>
        <li><strong>Location:</strong> {hotel.location}</li>
        {room && <li><strong>Room:</strong> {room.name}</li>}
        <li><strong>Check-in:</strong> {checkIn}</li>
        <li><strong>Check-out:</strong> {checkOut}</li>
        <li><strong>Guests:</strong> {guests}</li>
        <li><strong>Nights:</strong> {nights}</li>
        <li><strong>Total:</strong> ${total}</li>
      </ul>
    </div>
  )
}

export default BookingConfirmation