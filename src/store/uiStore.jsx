// src/store/uiStore.js
// ─────────────────────────────────────────────────────────────────
// UIContext: lightweight global UI state (drawer, discover carousel)
// Does NOT handle booking logic — that lives in BookingContext.
// ─────────────────────────────────────────────────────────────────
import { createContext, useContext, useReducer, useCallback } from 'react'

// ── Initial State ─────────────────────────────────────────────────
const initialUIState = {
  isProfileDrawerOpen: false,
  activeDiscoverIndex: 0,        // which sidebar item is active on /discover
  discoverAutoPlay: true,        // false when user manually clicks sidebar
  isWishlistDrawerOpen: false,
  toastQueue: [],                // [ { id, message, type: 'success'|'error'|'info' } ]
}

// ── Actions ───────────────────────────────────────────────────────
export const UI_ACTIONS = {
  OPEN_PROFILE_DRAWER:    'OPEN_PROFILE_DRAWER',
  CLOSE_PROFILE_DRAWER:   'CLOSE_PROFILE_DRAWER',
  TOGGLE_PROFILE_DRAWER:  'TOGGLE_PROFILE_DRAWER',
  OPEN_WISHLIST_DRAWER:   'OPEN_WISHLIST_DRAWER',
  CLOSE_WISHLIST_DRAWER:  'CLOSE_WISHLIST_DRAWER',
  SET_DISCOVER_INDEX:     'SET_DISCOVER_INDEX',
  SET_DISCOVER_AUTOPLAY:  'SET_DISCOVER_AUTOPLAY',
  PUSH_TOAST:             'PUSH_TOAST',
  DISMISS_TOAST:          'DISMISS_TOAST',
}

// ── Reducer ───────────────────────────────────────────────────────
function uiReducer(state, action) {
  switch (action.type) {
    case UI_ACTIONS.OPEN_PROFILE_DRAWER:
      return { ...state, isProfileDrawerOpen: true }
    case UI_ACTIONS.CLOSE_PROFILE_DRAWER:
      return { ...state, isProfileDrawerOpen: false }
    case UI_ACTIONS.TOGGLE_PROFILE_DRAWER:
      return { ...state, isProfileDrawerOpen: !state.isProfileDrawerOpen }
    case UI_ACTIONS.OPEN_WISHLIST_DRAWER:
      return { ...state, isWishlistDrawerOpen: true }
    case UI_ACTIONS.CLOSE_WISHLIST_DRAWER:
      return { ...state, isWishlistDrawerOpen: false }
    case UI_ACTIONS.SET_DISCOVER_INDEX:
      return { ...state, activeDiscoverIndex: action.payload }
    case UI_ACTIONS.SET_DISCOVER_AUTOPLAY:
      return { ...state, discoverAutoPlay: action.payload }
    case UI_ACTIONS.PUSH_TOAST:
      return { ...state, toastQueue: [...state.toastQueue, action.payload] }
    case UI_ACTIONS.DISMISS_TOAST:
      return { ...state, toastQueue: state.toastQueue.filter(t => t.id !== action.payload) }
    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────
const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [state, dispatch] = useReducer(uiReducer, initialUIState)

  // ── Convenience helpers ────────────────────────────────────────
  const openProfileDrawer  = useCallback(() => dispatch({ type: UI_ACTIONS.OPEN_PROFILE_DRAWER }), [])
  const closeProfileDrawer = useCallback(() => dispatch({ type: UI_ACTIONS.CLOSE_PROFILE_DRAWER }), [])
  const toggleProfileDrawer= useCallback(() => dispatch({ type: UI_ACTIONS.TOGGLE_PROFILE_DRAWER }), [])
  const openWishlistDrawer = useCallback(() => dispatch({ type: UI_ACTIONS.OPEN_WISHLIST_DRAWER }), [])
  const closeWishlistDrawer= useCallback(() => dispatch({ type: UI_ACTIONS.CLOSE_WISHLIST_DRAWER }), [])

  const setDiscoverIndex   = useCallback((idx) =>
    dispatch({ type: UI_ACTIONS.SET_DISCOVER_INDEX, payload: idx }), [])

  const pauseDiscoverAutoPlay = useCallback(() =>
    dispatch({ type: UI_ACTIONS.SET_DISCOVER_AUTOPLAY, payload: false }), [])
  const resumeDiscoverAutoPlay = useCallback(() =>
    dispatch({ type: UI_ACTIONS.SET_DISCOVER_AUTOPLAY, payload: true }), [])

  const pushToast = useCallback(({ message, type = 'info', duration = 3500 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    dispatch({ type: UI_ACTIONS.PUSH_TOAST, payload: { id, message, type } })
    setTimeout(() => dispatch({ type: UI_ACTIONS.DISMISS_TOAST, payload: id }), duration)
  }, [])

  const dismissToast = useCallback((id) =>
    dispatch({ type: UI_ACTIONS.DISMISS_TOAST, payload: id }), [])

  const value = {
    state,
    dispatch,
    // helpers
    openProfileDrawer,
    closeProfileDrawer,
    toggleProfileDrawer,
    openWishlistDrawer,
    closeWishlistDrawer,
    setDiscoverIndex,
    pauseDiscoverAutoPlay,
    resumeDiscoverAutoPlay,
    pushToast,
    dismissToast,
  }

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>')
  return ctx
}
