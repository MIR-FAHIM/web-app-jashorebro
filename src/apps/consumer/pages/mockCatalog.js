/**
 * @deprecated
 * Real data is now fully integrated through the Laravel API.
 * All consumer views fetch live database catalog items, drops, and user shelves.
 */
export const MOCK_DROPS = []
export const MOCK_PRODUCTS = []
export const getDrop = () => null
export const getProduct = () => null
export const toCartItem = (item, price = item?.retailPrice || 0) => ({
  id: item?.id,
  name: item?.title || item?.name,
  price,
  image: item?.image,
  category: item?.category,
})
