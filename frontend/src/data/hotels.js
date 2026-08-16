const hotels = [
  {
    id: 1,
    name: "Ocean Breeze Resort",
    location: "Bali, Indonesia",
    price: 120,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80",
    description: "Beachfront resort with private villas and infinity pools overlooking the ocean.",
    amenities: ["Free WiFi", "Pool", "Spa", "Breakfast included"],
    rooms: [
      { id: "standard", name: "Standard Room", price: 120 },
      { id: "deluxe", name: "Deluxe Ocean View", price: 180 },
      { id: "suite", name: "Villa Suite", price: 260 }
    ]
  },
  {
    id: 2,
    name: "Alpine Lodge",
    location: "Zermatt, Switzerland",
    price: 210,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
    description: "Cozy mountain lodge with ski-in/ski-out access and panoramic Alps views.",
    amenities: ["Free WiFi", "Ski storage", "Fireplace", "Restaurant"],
    rooms: [
      { id: "standard", name: "Standard Room", price: 210 },
      { id: "deluxe", name: "Deluxe Mountain View", price: 280 },
      { id: "suite", name: "Chalet Suite", price: 380 }
    ]
  },
  {
    id: 3,
    name: "Urban Central Hotel",
    location: "New York, USA",
    price: 180,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80",
    description: "Modern hotel steps from Times Square, ideal for business and city travel.",
    amenities: ["Free WiFi", "Gym", "Business center", "Bar"],
    rooms: [
      { id: "standard", name: "Standard Room", price: 180 },
      { id: "deluxe", name: "Deluxe City View", price: 240 },
      { id: "suite", name: "Executive Suite", price: 340 }
    ]
  },
  {
    id: 4,
    name: "Desert Oasis Inn",
    location: "Marrakech, Morocco",
    price: 95,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=600&q=80",
    description: "Traditional riad with a courtyard pool in the heart of the medina.",
    amenities: ["Free WiFi", "Pool", "Rooftop terrace", "Breakfast included"],
    rooms: [
      { id: "standard", name: "Standard Room", price: 95 },
      { id: "deluxe", name: "Deluxe Courtyard Room", price: 140 },
      { id: "suite", name: "Riad Suite", price: 210 }
    ]
  }
]

export default hotels