// Presentation data shared across consumer screens until the API is connected.
export const MOCK_DROPS = [
  {
    id: 'drop_1', title: 'Vintage Oversized Corduroy Hoodie', category: 'Streetwear', retailPrice: 1200,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80',
    description: 'A relaxed, oversized layer for everyday wear. Review the seller’s size guide and final specifications before ordering.',
    tiers: [{ requiredParticipants: 1, price: 1200 }, { requiredParticipants: 10, price: 1099 }, { requiredParticipants: 25, price: 999 }, { requiredParticipants: 50, price: 899 }, { requiredParticipants: 100, price: 799 }],
    currentParticipants: 18, isJoined: false, curator: { name: 'Fahim Ahmed', handle: 'fahim_vibes' },
    recommendation: 'A relaxed layer for your everyday rotation.', endsIn: '2 days 14 hours',
  },
  {
    id: 'drop_2', title: 'Havit H2002D RGB Gaming Headset', category: 'Tech & Gadgets', retailPrice: 2600,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    description: 'An over-ear headset for your desktop setup. Confirm compatibility, warranty, and final product specifications with the seller.',
    tiers: [{ requiredParticipants: 1, price: 2600 }, { requiredParticipants: 15, price: 2350 }, { requiredParticipants: 30, price: 2099 }],
    currentParticipants: 28, isJoined: true, curator: { name: 'Nabila Rahman', handle: 'nabila_edits' },
    recommendation: 'For late-night playlists and a better desk setup.', endsIn: '1 day 8 hours',
  },
]

export const MOCK_PRODUCTS = [
  {
    id: 'prod_1', title: 'Redragon K552 Mechanical Keyboard', category: 'Tech & Gadgets', retailPrice: 3200,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
    description: 'A compact mechanical keyboard for work and gaming. Check the selected switch type, layout, and warranty with the seller before ordering.',
    seller: { name: 'GadgetZone Jashore' },
  },
  {
    id: 'prod_2', title: 'Retro High-Top White Canvas Sneakers', category: 'Footwear', retailPrice: 1650,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
    description: 'An easy everyday pair to finish your rotation. Confirm the size guide, material, and available colors with the seller.',
    seller: { name: 'Street Studio Jashore' },
  },
]

export const getDrop = (id) => MOCK_DROPS.find((item) => item.id === id)
export const getProduct = (id) => MOCK_PRODUCTS.find((item) => item.id === id)
export const toCartItem = (item, price = item.retailPrice) => ({ id: item.id, name: item.title, price, image: item.image, category: item.category })
