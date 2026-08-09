// src/context/BookingContext.jsx
// ─────────────────────────────────────────────────────────────────
// Extended for GT Holidays Rebuild:
//   + foodPreferences per traveler
//   + wishlist (package ID array)
// ─────────────────────────────────────────────────────────────────
import { createContext, useContext, useReducer } from 'react'
import { calculatePrice } from '../backend/services/pricingEngine'

// ── Food preference options (exported for UI components) ──────────
export const FOOD_PREFS = ['veg', 'non-veg', 'vegan']

// ── Initial state ─────────────────────────────────────────────────
const initialState = {
  selectedPackage: null,   // full package doc from Firestore
  selectedDate:    null,   // { date: '2026-09-10', status: 'available' }
  travelers: {
    adults:   1,
    children: 0,
    infants:  0,
  },
  mealPlan: {
    breakfast: false,
    lunch: false,
    dinner: false,
  },
  mealType: 'veg', // 'veg', 'non-veg'
  promoCode:          '',
  promoDiscountPct:   0,
  promoApplied:       false,
  priceBreakdown:     null,  // result of calculatePrice()
  wishlist:           [],    // array of package IDs
  myTrips:            [],    // simulated local storage array of bookings
}

// ── Helpers ───────────────────────────────────────────────────────
function recomputePrice(state, overrides = {}) {
  const merged = { ...state, ...overrides }
  if (!merged.selectedPackage) return null
  return calculatePrice({
    basePriceAdult:    merged.selectedPackage.basePriceAdult,
    childPricePercent: merged.selectedPackage.childPricePercent,
    infantFee:         merged.selectedPackage.infantFee,
    ...merged.travelers,
    promoDiscountPct:  merged.promoDiscountPct,
    mealPlan:          merged.mealPlan,
    mealType:          merged.mealType,
  })
}

// ── Reducer ───────────────────────────────────────────────────────
function bookingReducer(state, action) {
  switch (action.type) {
    case 'SET_PACKAGE':
      return { ...initialState, selectedPackage: action.payload, wishlist: state.wishlist }

    case 'SET_DATE':
      return { ...state, selectedDate: action.payload }

    case 'SET_TRAVELERS': {
      const travelers = {
        adults:   Math.max(1, action.payload.adults   ?? state.travelers.adults),
        children: Math.max(0, action.payload.children ?? state.travelers.children),
        infants:  Math.max(0, action.payload.infants  ?? state.travelers.infants),
      }

      const priceBreakdown = recomputePrice(state, { travelers })
      return { ...state, travelers, priceBreakdown }
    }

    case 'TOGGLE_MEAL_PLAN': {
      const meal = action.payload // 'breakfast', 'lunch', 'dinner'
      const newMealPlan = { ...state.mealPlan, [meal]: !state.mealPlan[meal] }
      const priceBreakdown = recomputePrice(state, { mealPlan: newMealPlan })
      return { ...state, mealPlan: newMealPlan, priceBreakdown }
    }

    case 'SET_MEAL_TYPE': {
      // payload: 'veg' | 'non-veg'
      const priceBreakdown = recomputePrice(state, { mealType: action.payload })
      return { ...state, mealType: action.payload, priceBreakdown }
    }

    case 'APPLY_PROMO': {
      const { code, discountPct } = action.payload
      const priceBreakdown = recomputePrice(state, { promoDiscountPct: discountPct })
      return {
        ...state,
        promoCode:        code,
        promoDiscountPct: discountPct,
        promoApplied:     true,
        priceBreakdown,
      }
    }

    case 'REMOVE_PROMO': {
      const priceBreakdown = recomputePrice(state, { promoDiscountPct: 0 })
      return {
        ...state,
        promoCode:        '',
        promoDiscountPct: 0,
        promoApplied:     false,
        priceBreakdown,
      }
    }

    case 'TOGGLE_WISHLIST': {
      const id = action.payload
      const exists = state.wishlist.includes(id)
      return {
        ...state,
        wishlist: exists
          ? state.wishlist.filter(w => w !== id)
          : [...state.wishlist, id],
      }
    }

    case 'CONFIRM_BOOKING': {
      const newTrip = {
        bookingId: action.payload.bookingId,
        date: state.selectedDate?.date || new Date().toISOString().split('T')[0],
        packageTitle: state.selectedPackage.title,
        packageData: state.selectedPackage,
        travelers: state.travelers,
        priceBreakdown: state.priceBreakdown,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        amount: state.priceBreakdown.finalTotal
      }
      return {
        ...state,
        myTrips: [newTrip, ...state.myTrips]
      }
    }

    case 'RESET':
      return { ...initialState, wishlist: state.wishlist, myTrips: state.myTrips }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────
const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)
  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>')
  return ctx
}
