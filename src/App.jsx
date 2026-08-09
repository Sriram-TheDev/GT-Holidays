// src/App.jsx — Voyage India
// ─────────────────────────────────────────────────────────────────────────────
// Route tree:
//   /                           → redirect to /discover
//   /auth                       → AuthPage       (full-screen, no header)
//   /discover                   → DiscoverPage
//   /package/:packageId         → PackageDetailsPage
//   /checkout                   → Checkout
//   /confirmation/:bookingId    → Confirmation
//   /my-trips                   → MyTrips
//   /seed                       → SeedPage (admin)
//
// Code Splitting strategy:
//   Every page is loaded via React.lazy() so Vite creates separate JS chunks.
//   Combined with the manualChunks in vite.config.js this means:
//     - A user visiting /discover NEVER downloads the Checkout or MyTrips JS
//     - Each page's vendor deps (Firebase, GSAP, etc.) load only when needed
//     - Returning visits hit the browser cache for unchanged chunks
// ─────────────────────────────────────────────────────────────────────────────
import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider }    from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import { UIProvider }      from './store/uiStore'
import EffectsProvider     from './components/EffectsProvider'

// ── Eagerly loaded (always needed, tiny) ──────────────────────────────────────
import Header             from './components/layout/Header'
import PageTransition     from './components/PageTransition'
import LoadingFallback    from './components/ui/LoadingFallback'

// ── Lazily loaded pages (each becomes its own JS chunk) ───────────────────────
// Rule: any page > 10KB or that imports a heavy vendor gets lazy-loaded.
// The webpackChunkName comment gives the chunk a readable name in the build
// output (Vite respects the same syntax via Rollup).
const AuthPage           = lazy(() => import(/* webpackChunkName: "page-auth"     */ './pages/AuthPage'))
const DiscoverPage       = lazy(() => import(/* webpackChunkName: "page-discover"  */ './pages/DiscoverPage'))
const PackageDetailsPage = lazy(() => import(/* webpackChunkName: "page-package"   */ './pages/PackageDetailsPage'))
const Checkout           = lazy(() => import(/* webpackChunkName: "page-checkout"  */ './pages/Checkout'))
const Confirmation       = lazy(() => import(/* webpackChunkName: "page-confirm"   */ './pages/Confirmation'))
const MyTrips            = lazy(() => import(/* webpackChunkName: "page-mytrips"   */ './pages/MyTrips'))
const SeedPage           = lazy(() => import(/* webpackChunkName: "page-seed"      */ './pages/SeedPage'))

// ── AppContent: layout-aware shell ────────────────────────────────────────────
function AppContent() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/auth'

  return (
    <div className="min-h-screen w-full bg-[#0B0C10] text-white flex flex-col overflow-x-hidden custom-scrollbar">

      {/* Header hidden on /auth which manages its own chrome */}
      {!isAuthPage && <Header />}

      {/* Suspense boundary wraps all lazy routes.
          The LoadingFallback renders instantly (no external deps)
          while the route chunk is being downloaded. */}
      <main
        id="main-content"
        className="flex-1 w-full overflow-x-hidden"
        style={{ paddingTop: isAuthPage ? 0 : 64 }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <PageTransition key={location.pathname}>
            <Routes>
              {/* Root → discover */}
              <Route path="/"                        element={<Navigate to="/discover" replace />} />

              {/* Primary routes — all lazy-loaded */}
              <Route path="/auth"                    element={<AuthPage />} />
              <Route path="/discover"                element={<DiscoverPage />} />
              <Route path="/package/:packageId"      element={<PackageDetailsPage />} />
              <Route path="/checkout"                element={<Checkout />} />
              <Route path="/confirmation/:bookingId" element={<Confirmation />} />
              <Route path="/my-trips"                element={<MyTrips />} />
              <Route path="/seed"                    element={<SeedPage />} />
            </Routes>
          </PageTransition>
        </Suspense>
      </main>
    </div>
  )
}

// ── Root app — provider stack ──────────────────────────────────────────────────
export default function App() {
  return (
    <EffectsProvider>
      <UIProvider>
        <AuthProvider>
          <BookingProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </BookingProvider>
        </AuthProvider>
      </UIProvider>
    </EffectsProvider>
  )
}
