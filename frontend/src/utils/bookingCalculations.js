export function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0

  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = end - start
  const nights = Math.round(diffTime / (1000 * 60 * 60 * 24))

  return nights > 0 ? nights : 0
}

export function calculateTotal(nights, pricePerNight) {
  if (nights <= 0 || !pricePerNight) return 0
  return nights * pricePerNight
}