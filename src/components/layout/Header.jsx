// src/components/layout/Header.jsx
// GT Holidays — Persistent dark-glass navigation bar
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../../context/AuthContext'
import { useUI } from '../../store/uiStore'
import { Map, Compass, User, LogOut, Heart, Calendar, Menu, X, ChevronDown } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../backend/config/firebase'
import { useWishlist } from '../../hooks/useWishlist'
import { PACKAGES, formatINR } from '../../data/packages'

// ── Logo ──────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link to="/discover" className="flex items-center gap-2.5 group" aria-label="GT Holidays Home">
      <img
        src="/brand-logo.png"
        alt="GT Holidays Logo"
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          objectFit: 'cover'
        }}
      />
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.01em' }}>
        GT <span style={{ color: 'var(--color-accent-green)' }}>Holidays</span>
      </span>
    </Link>
  )
}

// ── User Avatar Menu ──────────────────────────────────────────────
function UserAvatarMenu({ user }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef(null)

  const { wishlist, toggleWishlist } = useWishlist()

  // Drawer is closed by the backdrop, so we don't need a global mousedown listener here.

  async function handleSignOut() {
    try { if (auth) await signOut(auth) } catch {}
    setOpen(false)
    navigate('/auth')
  }

  const photoUrl = user?.photoURL
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Traveller'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-full transition-all duration-200"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border-med)', padding: '5px 10px 5px 5px' }}
        aria-label="User menu"
        aria-expanded={open}
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #00FFA3, #3D9BFF)' }}>
          {photoUrl
            ? <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
            : <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0B0C10' }}>{initials}</span>
          }
        </div>
        <span style={{ fontSize: '0.85rem', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName}
        </span>
        <ChevronDown size={14} color="rgba(255,255,255,0.5)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0"
                style={{ zIndex: 9998, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                onClick={() => setOpen(false)}
              />
              {/* Side Drawer */}
              <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-[100dvh] w-80 flex flex-col overflow-hidden"
                style={{ zIndex: 9999, background: 'var(--color-surface-2)', borderLeft: '1px solid var(--color-border-med)', boxShadow: '-16px 0 48px rgba(0,0,0,0.6)' }}
              >
                <div className="flex shrink-0 items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-white font-bold" style={{ fontFamily: 'var(--font-display)' }}>Profile</span>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Close profile menu"
                  >
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>

                {/* User info block */}
                <div className="px-6 py-6 flex shrink-0 items-center gap-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #00FFA3, #3D9BFF)' }}>
                    {photoUrl
                      ? <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
                      : <User size={24} color="#0B0C10" />
                    }
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
                      {displayName}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email || 'Welcome to GT Holidays'}
                    </div>
                  </div>
                </div>

                {/* Menu Links */}
                <div className="flex-1 min-h-0 overflow-y-auto py-4 px-4 flex flex-col gap-2">
                  <button
                    onClick={() => { setOpen(false); navigate('/my-trips') }}
                    className="w-full shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left"
                    style={{ color: '#fff' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Calendar size={18} style={{ color: 'var(--color-accent-blue)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>My Trips</span>
                  </button>

                  {/* WISHLIST TEASER IN PROFILE */}
                  <div className="mt-4 mb-2 px-2 shrink-0">
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Heart size={14} /> My Wishlist
                    </h4>
                    {wishlist && wishlist.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {wishlist.map(id => {
                          const pkg = PACKAGES.find(p => p.id === id)
                          if (!pkg) return null
                          return (
                            <div key={id} className="relative group rounded-xl overflow-hidden cursor-pointer"
                              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                            >
                              <Link 
                                to={`/package/${pkg.id}`} 
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 p-2 w-full h-full"
                              >
                                <img src={pkg.img} alt={pkg.title} className="w-12 h-12 rounded-lg object-cover" />
                                <div className="flex-1 overflow-hidden">
                                  <h5 className="text-sm text-white font-medium truncate">{pkg.title}</h5>
                                  <div className="text-xs text-blue-400 mt-1">{pkg.duration}</div>
                                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                    {formatINR(pkg.basePriceAdult)} <span style={{ fontSize: '0.65rem' }}>/ adult</span>
                                  </div>
                                </div>
                              </Link>
                              {/* Quick Remove — must be a <button> for keyboard access & screen readers */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleWishlist(id);
                                }}
                                aria-label={`Remove ${pkg.title} from wishlist`}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                style={{ background: 'rgba(255,0,0,0.8)', border: 'none', cursor: 'pointer' }}
                              >
                                <X size={12} color="#fff" aria-hidden="true" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="py-8 px-4 text-center rounded-xl border border-dashed flex flex-col items-center justify-center"
                        style={{ borderColor: 'var(--color-border-hi)', background: 'rgba(255,255,255,0.02)' }}>
                        <Heart size={24} color="rgba(255,255,255,0.2)" className="mb-2 backdrop-blur-sm" />
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Your wishlist is empty.</p>
                        <button
                          onClick={() => { setOpen(false); navigate('/discover') }}
                          className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
                          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                          Explore Packages
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Info / Log Out Anchor */}
                <div className="p-6 pb-8 border-t shrink-0 mt-auto bg-[var(--color-surface-2)]" style={{ borderColor: 'var(--color-border)', zIndex: 10 }}>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg cursor-pointer"
                    style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B', fontSize: '0.9rem' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

// ── NavLink ───────────────────────────────────────────────────────
function NavLink({ to, label, icon }) {
  const location = useLocation()
  const active = location.pathname.startsWith(to)

  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 relative"
      style={{
        color: active ? '#fff' : 'rgba(255,255,255,0.55)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.875rem',
        fontWeight: 500,
        background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
    >
      {icon}
      {label}
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
          style={{ background: 'var(--color-accent-green)' }}
        />
      )}
    </Link>
  )
}

// ── Main Header ───────────────────────────────────────────────────
export default function Header() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Hide on auth page — auth page is full-screen
  const isAuthPage = location.pathname === '/auth'
  if (isAuthPage) return null

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname])

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        zIndex: 999,
        height: 64,
        background: scrolled ? 'rgba(11, 12, 16, 0.7)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border-med)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-5 md:px-8">
        {/* Left: Logo */}
        <Logo />

        {/* Center: Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/discover" label="Discover" icon={<Map size={15} />} />
          {currentUser && <NavLink to="/my-trips" label="My Trips" icon={<Calendar size={15} />} />}
        </nav>

        {/* Right: Auth / Avatar */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <UserAvatarMenu user={currentUser} />
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="btn-cta hidden md:flex"
              style={{ padding: '8px 20px', fontSize: '0.875rem', borderRadius: '10px' }}
            >
              Get Started
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)' }}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden"
            style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}
          >
            <div className="px-5 py-4 flex flex-col gap-2">
              <Link to="/discover" className="flex items-center gap-2 py-2 px-3 rounded-xl" style={{ color: '#fff', fontFamily: 'var(--font-body)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Map size={16} /> Discover
              </Link>
              {currentUser && (
                <Link to="/my-trips" className="flex items-center gap-2 py-2 px-3 rounded-xl" style={{ color: '#fff', fontFamily: 'var(--font-body)' }}>
                  <Calendar size={16} /> My Trips
                </Link>
              )}
              {!currentUser && (
                <button onClick={() => navigate('/auth')} className="btn-cta mt-2" style={{ borderRadius: '10px' }}>
                  Get Started
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
