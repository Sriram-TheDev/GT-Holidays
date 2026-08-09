import { useBooking } from '../context/BookingContext'

export function useWishlist() {
  const { state, dispatch } = useBooking()

  const toggleWishlist = (pkgId) => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: pkgId })
  }

  const isWishlisted = (pkgId) => {
    return state.wishlist.includes(pkgId)
  }

  return { 
    wishlist: state.wishlist, 
    toggleWishlist, 
    isWishlisted 
  }
}
