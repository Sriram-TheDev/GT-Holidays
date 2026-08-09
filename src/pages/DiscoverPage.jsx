// src/pages/DiscoverPage.jsx
// ─────────────────────────────────────────────────────────────────
// GT Holidays — Hero Carousel + Package Discovery Page
// Layout: 2-col hero (left big banner | right sidebar tabs)
//         + full-width package grid below
//
// GSAP:  useGSAP for auto-cycling carousel (crossfade + slide)
//        ScrollTrigger for grid section entrance
// ─────────────────────────────────────────────────────────────────
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Heart, ArrowRight, Star, MapPin, Clock, ChevronRight,
  Pause, Play, Compass, Sparkles, Search, Filter, X
} from 'lucide-react'

import { HERO_PACKAGES, GRID_PACKAGES, PACKAGES, formatINR } from '../data/packages'
import SidebarCard from '../components/discover/SidebarCard'
import PackageGridCard from '../components/discover/PackageGridCard'
import Footer from '../components/Footer'
import { useBooking } from '../context/BookingContext'
import PageMeta from '../components/seo/PageMeta'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// ── Auto-slide interval ───────────────────────────────
const SLIDE_INTERVAL_MS = 5000

// ── Hero Banner (left panel) ──────────────────────────────────────
function HeroBanner({ pkg, prevPkg, isTransitioning, onBook, onWishlist, isWishlisted }) {
  const bannerRef = useRef(null)
  const contentRef = useRef(null)

  // GSAP crossfade on package change
  useGSAP(() => {
    if (!bannerRef.current || !contentRef.current) return
    const tl = gsap.timeline()
    tl.fromTo(contentRef.current,
      { opacity: 0, y: 22, filter: 'blur(4px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 0.65,
        ease: 'power3.out',
        force3D: true,
        clearProps: 'filter',
      }
    )
    return () => tl.kill()
  }, { dependencies: [pkg.id], scope: bannerRef })

  const badgeColors = {
    'BEST SELLER': { bg: 'rgba(0,255,163,0.18)', color: '#00FFA3', border: 'rgba(0,255,163,0.4)' },
    'TRENDING':    { bg: 'rgba(61,155,255,0.18)', color: '#3D9BFF', border: 'rgba(61,155,255,0.4)' },
    'HOT DEAL':    { bg: 'rgba(255,122,48,0.18)', color: '#FF7A30', border: 'rgba(255,122,48,0.4)' },
    'PREMIUM':     { bg: 'rgba(176,105,255,0.18)', color: '#B069FF', border: 'rgba(176,105,255,0.4)' },
  }
  const badge = badgeColors[pkg.badge] ?? badgeColors['BEST SELLER']

  return (
    <div
      ref={bannerRef}
      style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        height: '100%',
        minHeight: 480,
        cursor: 'pointer',
        // Ambient glow behind the card
        boxShadow: `0 0 60px rgba(${pkg.glowRgb},0.22), 0 0 120px rgba(${pkg.glowRgb},0.08)`,
        transition: 'box-shadow 0.8s ease',
      }}
      onClick={() => onBook(pkg)}
    >
      {/* Background image with crossfade */}
      <AnimatePresence initial={false}>
        <motion.img
          key={pkg.id + '-img'}
          src={pkg.img}
          alt={pkg.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          draggable={false}
        />
      </AnimatePresence>

      {/* Gradient overlay — bottom heavy for text legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(
          to top,
          rgba(11,12,16,0.97) 0%,
          rgba(11,12,16,0.7) 35%,
          rgba(11,12,16,0.15) 65%,
          transparent 100%
        )`,
      }} />

      {/* Top-right: badge + rating */}
      <div style={{
        position: 'absolute', top: 20, right: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
      }}>
        <div style={{
          padding: '4px 12px',
          borderRadius: 99,
          background: badge.bg,
          border: `1px solid ${badge.border}`,
          backdropFilter: 'blur(10px)',
          fontSize: '0.72rem', fontWeight: 700,
          color: badge.color,
          letterSpacing: '0.07em',
          fontFamily: 'var(--font-display)',
        }}>
          {pkg.badge}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px',
          borderRadius: 10,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Star size={13} fill="#FFD166" color="#FFD166" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{pkg.rating}</span>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>({pkg.reviewCount.toLocaleString('en-IN')})</span>
        </div>
      </div>

      {/* Bottom content — animated per slide change */}
      <div
        ref={contentRef}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '28px 28px 28px',
        }}
      >
        {/* Location + duration row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          marginBottom: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <MapPin size={13} color={pkg.glow} />
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)' }}>
              {pkg.location}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={13} color={pkg.glow} />
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
              {pkg.duration}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: 8,
        }}>
          {pkg.title}
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.55)',
          marginBottom: 16,
          maxWidth: 420,
          lineHeight: 1.5,
        }}>
          {pkg.subtitle}
        </p>

        {/* Highlights pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {pkg.highlights.slice(0, 3).map(h => (
            <span key={h} style={{
              padding: '3px 10px',
              borderRadius: 99,
              background: `rgba(${pkg.glowRgb},0.12)`,
              border: `1px solid rgba(${pkg.glowRgb},0.25)`,
              color: pkg.glow,
              fontSize: '0.72rem',
              fontWeight: 500,
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Price + CTA row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Starting from</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.9rem',
                fontWeight: 700,
                color: '#fff',
              }}>
                {formatINR(pkg.basePriceAdult)}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>/ adult</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Wishlist icon button */}
            <button
              onClick={e => { e.stopPropagation(); onWishlist(pkg.id) }}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              style={{
                width: 44, height: 44,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                background: isWishlisted
                  ? 'rgba(255,107,107,0.12)'
                  : 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Heart
                size={18}
                color={isWishlisted ? '#FF6B6B' : 'rgba(255,255,255,0.6)'}
                fill={isWishlisted ? '#FF6B6B' : 'transparent'}
              />
            </button>

            {/* Book Now CTA */}
            <button
              onClick={e => { e.stopPropagation(); onBook(pkg) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 24px',
                borderRadius: 14,
                background: pkg.glow,
                color: '#0B0C10',
                fontFamily: 'var(--font-display)',
                fontSize: '0.92rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: `0 8px 24px rgba(${pkg.glowRgb},0.4)`,
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Book Now
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────
function ProgressBar({ activeIndex, total, glow }) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '0 4px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1,
          height: 3,
          borderRadius: 99,
          background: i === activeIndex ? glow : 'rgba(255,255,255,0.15)',
          transition: 'background 0.4s ease',
          overflow: 'hidden',
        }}>
          {i === activeIndex && (
            <motion.div
              key={activeIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: SLIDE_INTERVAL_MS / 1000, ease: 'linear' }}
              style={{ height: '100%', background: glow, borderRadius: 99 }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main DiscoverPage ─────────────────────────────────────────────
export default function DiscoverPage() {
  const navigate = useNavigate()
  const { state, dispatch } = useBooking()

  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All Regions')
  const [selectedCategory, setSelectedCategory] = useState('All Types')
  const [priceRange, setPriceRange] = useState(60000)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const intervalRef = useRef(null)
  const sidebarRef = useRef(null)
  const gridRef = useRef(null)
  const heroRef = useRef(null)

  const activePkg = HERO_PACKAGES[activeIndex]

  const filteredPackages = useMemo(() => {
    return GRID_PACKAGES.filter(pkg => {
      const matchSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pkg.location.toLowerCase().includes(searchQuery.toLowerCase())
      const matchRegion = selectedRegion === 'All Regions' || pkg.region === selectedRegion
      const matchCategory = selectedCategory === 'All Types' || pkg.type === selectedCategory
      const matchPrice = pkg.basePriceAdult <= priceRange

      return matchSearch && matchRegion && matchCategory && matchPrice
    })
  }, [searchQuery, selectedRegion, selectedCategory, priceRange])

  // Prevent horizontal overflow
  useEffect(() => {
    document.body.style.overflowX = 'hidden'
    return () => { document.body.style.overflowX = '' }
  }, [])

  // ── GSAP Grid Entrance ──────────────────────────────────────────
  useGSAP(() => {
    if (!gridRef.current) return
    // Staggered entrance for grid cards on scroll
    gsap.fromTo('.pkg-grid-card',
      { opacity: 0, y: 48 },
      {
        opacity: 1, y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        force3D: true,
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 82%',
          once: true,
        },
      }
    )
    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, { scope: gridRef, dependencies: [] })

  // ── Auto-slide engine ───────────────────────────────────────────
  const startSlider = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActiveIndex(i => (i + 1) % HERO_PACKAGES.length)
    }, SLIDE_INTERVAL_MS)
  }, [])

  useEffect(() => {
    if (!isPaused) startSlider()
    else clearInterval(intervalRef.current)
    return () => clearInterval(intervalRef.current)
  }, [isPaused, startSlider])

  // ── Sidebar auto-scroll to active item ─────────────────────────
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar) return
    const activeEl = sidebar.querySelector(`[data-index="${activeIndex}"]`)
    if (activeEl) {
      sidebar.scrollTo({
        top: activeEl.offsetTop - 8, // slight offset for padding
        behavior: 'smooth'
      })
    }
  }, [activeIndex])

  // ── Handlers ───────────────────────────────────────────────────
  function handleSidebarClick(index) {
    setActiveIndex(index)
    setIsPaused(true)
    // Resume auto-slide after 10s of user inactivity
    clearInterval(intervalRef.current)
    intervalRef.current = setTimeout(() => setIsPaused(false), 10000)
  }

  function handleBook(pkg) {
    dispatch({ type: 'SET_PACKAGE', payload: pkg })
    navigate(`/package/${pkg.id}`)
  }

  function handleWishlist(id) {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: id })
  }

  const isWishlisted = state.wishlist.includes(activePkg.id)

  return (
    <div style={{ background: 'var(--color-base)', minHeight: '100vh', width: '100%', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Static SEO Meta (content doesn't change per-filter on the client) ── */}
      <PageMeta
        title="Discover India Travel Packages | Voyage India"
        description="Browse curated land-only holiday packages across India — Kerala backwaters, Himachal mountains, Goa beaches, Rajasthan forts, and more. Compare, filter, and book in minutes."
        canonicalPath="/discover"
      />

      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="mx-auto px-4 lg:px-8 w-full" style={{ maxWidth: 1380, paddingTop: 32 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ color: 'var(--color-accent-green)', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
            <span style={{
              fontSize: '0.78rem', letterSpacing: '0.1em',
              color: 'var(--color-accent-green)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
            }}>
              FEATURED EXPERIENCES
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}>
              Discover India
            </h1>

            {/* Pause/Play toggle */}
            <button
              onClick={() => setIsPaused(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 14px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--color-border-med)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
            >
              {isPaused ? <Play size={13} /> : <Pause size={13} />}
              {isPaused ? 'Paused' : 'Auto-play'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="mx-auto px-4 lg:px-8 w-full mt-5 flex flex-col lg:grid lg:grid-cols-[1fr_280px] items-stretch gap-4"
        style={{
          maxWidth: 1380
        }}
      >
        {/* ── LEFT: Main Banner ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ minHeight: 520, width: '100%' }}
        >
          <HeroBanner
            pkg={activePkg}
            isWishlisted={isWishlisted}
            onBook={handleBook}
            onWishlist={handleWishlist}
          />
        </motion.div>

        {/* ── RIGHT: Sidebar ── */}
        <motion.div
          className="sidebar-panel"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 24,
            padding: '12px 8px',
            overflow: 'hidden',
          }}
        >
          {/* Sidebar header */}
          <div style={{
            padding: '4px 8px 12px',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: 8,
          }}>
            <p style={{
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
            }}>
              {HERO_PACKAGES.length} FEATURED PACKAGES
            </p>
          </div>

          {/* Scrollable sidebar cards */}
          <div
            ref={sidebarRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              paddingRight: 2,
              position: 'relative',
            }}
          >
            {HERO_PACKAGES.map((pkg, i) => (
              <div key={pkg.id} data-index={i}>
                <SidebarCard
                  pkg={pkg}
                  isActive={i === activeIndex}
                  index={i}
                  onClick={() => handleSidebarClick(i)}
                />
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div style={{ marginTop: 12, padding: '12px 8px 4px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ProgressBar
              activeIndex={activeIndex}
              total={HERO_PACKAGES.length}
              glow={activePkg.glow}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Section Divider ──────────────────────────────────────── */}
      <div className="mx-auto px-4 lg:px-8 w-full" style={{ maxWidth: 1380, marginTop: 48 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(176,105,255,0.1)',
              border: '1px solid rgba(176,105,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={14} color="var(--color-accent-purple)" />
            </div>
            <span style={{
              fontSize: '0.78rem', letterSpacing: '0.1em',
              color: 'var(--color-accent-purple)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
            }}>
              ALL DESTINATIONS
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}>
              Explore All Packages
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              {filteredPackages.length} destinations available
            </span>
          </div>

          {/* ── Search & Filters ── */}
          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center', position: 'relative', zIndex: 10 }}>
            {/* Search Input */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '0 16px',
              height: 48,
              transition: 'border-color 0.2s',
            }}>
              {/* Screen-reader label for the search input */}
              <label htmlFor="discover-search" className="sr-only">Search packages by region, city, or name</label>
              <Search size={18} color="rgba(255,255,255,0.4)" aria-hidden="true" />
              <input
                id="discover-search"
                type="search"
                placeholder="Search regions, cities, distinct packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.9rem',
                  padding: '0 12px',
                  outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
              />
            </div>
            
            {/* Filter Toggle */}
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 48,
                padding: '0 20px',
                background: isFilterOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              <Filter size={18} />
              Filters
            </button>

            {/* Filter Popup Window */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    width: '100%',
                    maxWidth: 340,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Filters</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button 
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedRegion('All Regions')
                          setSelectedCategory('All Types')
                          setPriceRange(60000)
                        }} 
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: 'rgba(255,255,255,0.6)', 
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontFamily: 'var(--font-body)',
                          padding: 0
                        }}
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        aria-label="Close filters"
                        style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', padding: 0 }}
                      >
                        <X size={20} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Region Select */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Region</label>
                    <select 
                      value={selectedRegion} 
                      onChange={e => setSelectedRegion(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 12px',
                        background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)',
                        borderRadius: 8, color: '#fff', outline: 'none'
                      }}>
                      {['All Regions', 'North', 'South', 'East', 'West', 'Islands'].map(r => (
                        <option key={r} value={r} style={{ background: '#111' }}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Type Select */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Package Type</label>
                    <select 
                      value={selectedCategory} 
                      onChange={e => setSelectedCategory(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 12px',
                        background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)',
                        borderRadius: 8, color: '#fff', outline: 'none'
                      }}>
                      {['All Types', 'Nature', 'Adventure', 'Culture', 'Heritage', 'Party', 'Parks', 'Leisure'].map(t => (
                        <option key={t} value={t} style={{ background: '#111' }}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Slider */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 8 }}>
                      <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Max Price</label>
                      <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{formatINR(priceRange)}</span>
                    </div>
                    <input 
                      type="range"
                      min="5000" max="60000" step="1000"
                      value={priceRange}
                      onChange={e => setPriceRange(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--color-accent-green)' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{
            height: 1,
            background: 'linear-gradient(to right, transparent, var(--color-border-med), transparent)',
            marginTop: 24,
          }} />
        </motion.div>
      </div>

      {/* ── Package Grid ─────────────────────────────────────────── */}
      <div
        ref={gridRef}
        className="pkg-grid mx-auto px-4 lg:px-8 w-full"
        style={{
          maxWidth: 1380,
          marginTop: 28,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
          minHeight: 400
        }}
      >
        {filteredPackages.length > 0 ? (
          filteredPackages.map((pkg, i) => (
            <div key={pkg.id} className="pkg-grid-card">
              <PackageGridCard pkg={pkg} index={i} />
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.02)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 
            }}>
              <Search size={28} color="rgba(255,255,255,0.2)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', fontFamily: 'var(--font-display)', marginBottom: 8 }}>No packages found</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 300, fontSize: '0.9rem', lineHeight: 1.5 }}>
              Try adjusting your filters or search query to find the perfect destination.
            </p>
          </div>
        )}
      </div>
      
      {/* ── Footer ───────────────────────────────────────────────── */}
      <div style={{ marginTop: 80 }}>
        <Footer />
      </div>
    </div>
  )
}
