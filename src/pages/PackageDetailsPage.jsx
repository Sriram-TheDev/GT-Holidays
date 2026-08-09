// src/pages/PackageDetailsPage.jsx
// ─────────────────────────────────────────────────────────────────
// GT Holidays — Package Details Page
// Features: App Store aesthetic, GSAP Sticky Header, 
//           Scroll-triggered condensing, Media Carousel
// ─────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Heart, ArrowRight, Star, MapPin, Clock, ChevronLeft,
  ChevronRight, Calendar, Info, Check, Share2, Compass
} from 'lucide-react'

import { PACKAGES, formatINR } from '../data/packages'
import { useBooking } from '../context/BookingContext'
import ItineraryMap from '../components/ItineraryMap'
import PageMeta from '../components/seo/PageMeta'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// ── Dummy Media & Reviews ─────────────────────────────────────────
const DUMMY_MEDIA = [
  '/media/room.png',
  '/media/food.png',
  '/media/safari.png',
  // Fallbacks if only 3
]

const DUMMY_REVIEWS = [
  { id: 1, name: 'Priya Nair', rating: 5, date: '2 days ago', avatar: 'P', text: 'Absolutely breathtaking experience! The attention to detail from the GT Holidays team made this trip unforgettable.' },
  { id: 2, name: 'Rohan Sharma', rating: 4, date: '1 week ago', avatar: 'R', text: 'Great itinerary and fantastic stays. The food could have been slightly more varied, but overall an amazing adventure.' },
  { id: 3, name: 'Aisha Gupta', rating: 5, date: '1 month ago', avatar: 'A', text: 'A premium feel from start to finish. Everything was taken care of seamlessly.' },
]

const RATINGS = [
  { stars: 5, count: 2100, pct: 85 },
  { stars: 4, count: 400,  pct: 10 },
  { stars: 3, count: 120,  pct: 3 },
  { stars: 2, count: 60,   pct: 1.5 },
  { stars: 1, count: 20,   pct: 0.5 },
]

export default function PackageDetailsPage() {
  const { packageId } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useBooking()
  
  // Find package or fallback
  const pkg = PACKAGES.find(p => p.id === packageId)
  
  // Refs for GSAP
  const containerRef = useRef(null)
  const heroRef = useRef(null)
  const stickyHeaderRef = useRef(null)

  // Show page not found if invalid ID
  if (!pkg) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Package not found.</h2>
      </div>
    )
  }

  const isWishlisted = state.wishlist.includes(pkg.id)
  const media = [pkg.img, ...DUMMY_MEDIA]

  // ── GSAP ScrollTrigger for Sticky Header ──────────────────────────
  useGSAP(() => {
    // We want the sticky header to fade in and slide down once we scroll past the hero
    const header = stickyHeaderRef.current
    const hero = heroRef.current
    if (!header || !hero) return

    // Initially hide the header (placed fixed at top)
    gsap.set(header, { yPercent: -150, opacity: 0 })

    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom top+=64', // When bottom of hero hits 64px from top
      end: 'bottom top+=64',
      onEnter: () => gsap.to(header, { yPercent: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }),
      onLeaveBack: () => gsap.to(header, { yPercent: -150, opacity: 0, duration: 0.3, ease: 'power2.in' }),
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, { scope: containerRef, dependencies: [] })

  // ── Handlers ───────────────────────────────────────────────────
  function handleBook() {
    dispatch({ type: 'SET_PACKAGE', payload: pkg })
    navigate('/checkout')
  }

  return (
    <div ref={containerRef} style={{ background: 'var(--color-base)', paddingBottom: 100, position: 'relative', width: '100%', overflowX: 'hidden' }}>

      {/* ── Dynamic SEO Meta ── */}
      <PageMeta
        title={`${pkg.title} — ${pkg.duration} | Voyage India`}
        description={`${pkg.subtitle}. Explore ${pkg.location} in ${pkg.duration} starting from ₹${pkg.basePriceAdult.toLocaleString('en-IN')}. ${pkg.highlights.slice(0, 3).join(', ')} and more.`}
        image={pkg.img}
        canonicalPath={`/package/${pkg.id}`}
        ogType="article"
      />
      
      {/* ── STICKY CONDENSED HEADER (App Store Style) ── */}
      <div
        ref={stickyHeaderRef}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: 72,
          background: 'rgba(11, 12, 16, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="w-full max-w-[1000px] px-4 lg:px-8 mx-auto flex items-center justify-between">
          {/* Left: Icon, Title, Provider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img 
              src={pkg.img} 
              alt="" 
              style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} 
            />
            <div>
              <h3 style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '1.05rem', 
                fontWeight: 700, 
                color: '#fff', 
                lineHeight: 1.2 
              }}>
                {pkg.title}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>by GT Holidays</p>
            </div>
          </div>
          
          {/* Right: Price & CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right', display: 'none', '@media (minWidth: 640px)': { display: 'block' } }}>
              <p style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '1.1rem', 
                fontWeight: 700, 
                color: pkg.glow 
              }}>
                {formatINR(pkg.basePriceAdult)}
              </p>
            </div>
            <button 
              onClick={handleBook}
              style={{
                background: pkg.glow,
                color: '#000',
                border: 'none',
                borderRadius: 99,
                padding: '8px 20px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: `0 4px 14px rgba(${pkg.glowRgb}, 0.3)`
              }}
            >
              Book
            </button>
          </div>
        </div>
      </div>

      {/* ── TOP HERO SECTION ───────────────────────────────────── */}
      <div
        ref={heroRef}
        className="mx-auto px-4 lg:px-8 w-full pt-6"
        style={{
          maxWidth: 1000,
          position: 'relative'
        }}
      >
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => navigate('/discover')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 6, 
            background: 'transparent', border: 'none', color: 'var(--color-text-muted)', 
            cursor: 'pointer', marginBottom: 20, padding: 0 
          }}
        >
          <ChevronLeft size={16} /> Back to Discover
        </button>

        {/* Hero Artwork */}
        <div style={{ 
          width: '100%', 
          height: 'clamp(300px, 40vh, 500px)', 
          borderRadius: 24, 
          overflow: 'hidden',
          position: 'relative',
          boxShadow: `0 0 60px rgba(${pkg.glowRgb},0.15)`
        }}>
          <img 
            src={pkg.img} 
            alt={pkg.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          {/* Vignette */}
          <div style={{ 
            position: 'absolute', inset: 0, 
            background: 'radial-gradient(circle at center, transparent 30%, rgba(11,12,16,0.6) 100%)' 
          }} />
        </div>

        {/* Hero Meta (App Store style header) */}
        <div style={{ 
          display: 'flex', gap: 24, padding: '24px 0 32px', 
          borderBottom: '1px solid var(--color-border)' 
        }}>
          
          <div style={{ flex: 1 }}>
            {/* Title & Provider */}
            <h1 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
              fontWeight: 800, 
              color: '#fff', 
              letterSpacing: '-0.02em',
              marginBottom: 4
            }}>
              {pkg.title}
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
              Curated by <span style={{ color: pkg.glow, fontWeight: 500 }}>GT Holidays</span>
            </p>
            
            {/* Action Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button 
                onClick={handleBook}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: pkg.glow,
                  color: '#000',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 28px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: `0 8px 24px rgba(${pkg.glowRgb}, 0.3)`,
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Book <span style={{ opacity: 0.7 }}>—</span> {formatINR(pkg.basePriceAdult)}
              </button>
              
              <button
                onClick={() => dispatch({ type: 'TOGGLE_WISHLIST', payload: pkg.id })}
                aria-label={isWishlisted ? `Remove ${pkg.title} from wishlist` : `Add ${pkg.title} to wishlist`}
                aria-pressed={isWishlisted}
                style={{
                  width: 46, height: 46,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  color: isWishlisted ? '#FF6B6B' : '#fff'
                }}
              >
                <Heart fill={isWishlisted ? '#FF6B6B' : 'transparent'} size={20} aria-hidden="true" />
              </button>
              
              <button
                aria-label="Share this package"
                style={{
                  width: 46, height: 46,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff'
                }}
              >
                <Share2 size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
          
          {/* Quick Stats Column */}
          <div style={{ 
            display: 'flex', flexDirection: 'column', gap: 16, 
            minWidth: 160, paddingTop: 8 
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{pkg.rating}</span>
                <Star size={16} fill="#FFD166" color="#FFD166" />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {pkg.reviewCount.toLocaleString('en-IN')} Ratings
              </p>
            </div>
            <div>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>12+</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Age Requirement</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── CONTENT SECTION ────────────────────────────────────── */}
      <div className="max-w-[1000px] mx-auto px-4 lg:px-8 w-full">
        
        {/* SCROLLING MEDIA CAROUSEL */}
        <div style={{ margin: '40px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, marginBottom: 16 }}>
            Preview
          </h2>
          <div style={{ 
            display: 'flex', gap: 16, overflowX: 'auto', 
            paddingBottom: 16, scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none', // hide for Firefox
            WebkitOverflowScrolling: 'touch',
          }}>
            {media.map((src, idx) => (
              <img 
                key={idx}
                src={src}
                alt={`Preview ${idx + 1}`}
                style={{
                  width: 'calc(100% - 40px)', 
                  maxWidth: 400,
                  height: 250,
                  objectFit: 'cover',
                  borderRadius: 16,
                  flexShrink: 0,
                  scrollSnapAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              />
            ))}
          </div>
        </div>

        {/* DESCRIPTION & HIGHLIGHTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, borderBottom: '1px solid var(--color-border)', paddingBottom: 40 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, marginBottom: 16 }}>
              About this experience
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 16 }}>
              {pkg.subtitle}. Immerse yourself in a fully curated experience designed for the modern explorer. From premium stays to authentic local interactions, every moment is meticulously planned to ensure maximum relaxation and adventure.
            </p>
            <button style={{ 
              background: 'transparent', border: 'none', 
              color: pkg.glow, fontSize: '0.9rem', fontWeight: 500, 
              cursor: 'pointer', padding: 0 
            }}>
              more
            </button>
          </div>
          
          <div style={{ background: 'var(--color-surface)', borderRadius: 20, padding: 24, border: '1px solid var(--color-border)', height: 'fit-content' }}>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 16 }}>
              Highlights
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pkg.highlights.map(h => (
                <li key={h} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.9rem', color: '#fff' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: `rgba(${pkg.glowRgb},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color={pkg.glow} />
                  </div>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ITINERARY & ROUTE MAP */}
        <ItineraryMap itinerary={pkg.itinerary} packageColor={pkg.glowRgb} />

        {/* REVIEWS & RATINGS */}
        <div style={{ paddingTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600 }}>
              Ratings & Reviews
            </h2>
            <button style={{ background: 'transparent', border: 'none', color: pkg.glow, fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
              See All
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Overall Stat */}
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                  {pkg.rating}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 8px' }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#FFD166" color="#FFD166" />)}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>out of 5</p>
              </div>
              
              {/* Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 200, flexGrow: 1 }}>
                {RATINGS.map(r => (
                  <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 14, textAlign: 'right' }}>
                      <Star size={10} fill="var(--color-text-muted)" color="var(--color-text-muted)" />
                    </div>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${r.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ height: '100%', background: 'var(--color-text-muted)', borderRadius: 2 }} 
                      />
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: 4 }}>
                  {pkg.reviewCount.toLocaleString('en-IN')} Ratings
                </p>
              </div>
            </div>
          </div>
          
          {/* Review Cards */}
          <div style={{ 
            display: 'flex', gap: 16, overflowX: 'auto', 
            paddingTop: 32, paddingBottom: 16, scrollbarWidth: 'none' 
          }}>
            {DUMMY_REVIEWS.map(r => (
              <div key={r.id} style={{ 
                minWidth: 280, maxWidth: 320, 
                background: 'var(--color-surface)', 
                border: '1px solid var(--color-border)', 
                borderRadius: 20, padding: 20,
                scrollSnapAlign: 'start'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                      {r.avatar}
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{r.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{r.date}</span>
                </div>
                <div style={{ display: 'flex', marginBottom: 8 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} fill={i < r.rating ? "#FFD166" : "rgba(255,255,255,0.1)"} color={i < r.rating ? "#FFD166" : "transparent"} />
                  ))}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                  {r.text}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  )
}
