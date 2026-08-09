// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../backend/config/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser]       = useState(null)
  const [phoneVerified, setPhoneVerified]   = useState(false)
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    // If Firebase not configured (empty .env in dev), resolve immediately
    if (!auth) {
      setLoading(false)
      return
    }

    // Safety fallback: if Firebase hangs (e.g. adblocker, bad network), force load after 2.5 seconds
    const fallbackTimer = setTimeout(() => {
      setLoading(p => {
        if (p) console.warn('[AuthContext] Firebase auth check timed out, forcing unlock.')
        return false
      })
    }, 2500)

    let unsubscribe = () => {}
    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        clearTimeout(fallbackTimer)
        if (user) {
          try {
            const snap = await getDoc(doc(db, 'users', user.uid))
            setPhoneVerified(snap.exists() ? !!snap.data().phoneVerified : false)
          } catch {
            setPhoneVerified(false)
          }
          setCurrentUser(user)
        } else {
          setCurrentUser(null)
          setPhoneVerified(false)
        }
        setLoading(false)
      })
    } catch (err) {
      clearTimeout(fallbackTimer)
      console.warn('[AuthContext] Firebase error:', err.message)
      setLoading(false)
    }
    return () => {
      clearTimeout(fallbackTimer)
      unsubscribe()
    }
  }, [])

  const value = { currentUser, phoneVerified, setPhoneVerified, loading }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
