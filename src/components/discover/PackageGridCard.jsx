// src/components/discover/PackageGridCard.jsx
// Responsive grid card for the "More Destinations" section below the hero
//
// A11Y FIX: The previous version used <motion.article role="button"> wrapping
// a <button> — this is a "nested interactive controls" WCAG violation (4.1.3).
// Fix: The article is now a semantic non-interactive container. A visually
// invisible <a> covers the entire card for click/keyboard navigation (the
// "block link" pattern), while the explicit "Explore" button is removed to
// prevent nesting. The article's content remains accessible to screen readers.
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { formatINR } from '../../data/packages'
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'

export default function PackageGridCard({ pkg, index }) {
  const navigate = useNavigate()
  const { dispatch } = useBooking()

  function handleSelect() {
    dispatch({ type: 'SET_PACKAGE', payload: pkg })
    navigate(`/package/${pkg.id}`)
  }

  // Badge colors
  const badgeColors = {
    'BEST SELLER': { bg: 'rgba(0,255,163,0.15)', color: '#00FFA3', border: 'rgba(0,255,163,0.3)' },
    'TRENDING':    { bg: 'rgba(61,155,255,0.15)', color: '#3D9BFF', border: 'rgba(61,155,255,0.3)' },
    'HOT DEAL':    { bg: 'rgba(255,122,48,0.15)', color: '#FF7A30', border: 'rgba(255,122,48,0.3)' },
    'PREMIUM':     { bg: 'rgba(176,105,255,0.15)', color: '#B069FF', border: 'rgba(176,105,255,0.3)' },
    'EXCLUSIVE':   { bg: 'rgba(0,255,163,0.15)', color: '#00FFA3', border: 'rgba(0,255,163,0.3)' },
    'CULTURAL':    { bg: 'rgba(255,209,102,0.15)', color: '#FFD166', border: 'rgba(255,209,102,0.3)' },
  }
  const badge = badgeColors[pkg.badge] ?? badgeColors['CULTURAL']

  return (
    // ── The "block link" pattern ──────────────────────────────────────────────
    // <article> is a semantic landmark for card content — NOT interactive.
    // The <a> absolutely fills the entire card, making the whole surface
    // keyboard-navigable and screen-reader-accessible as a single focusable unit.
    // There are NO nested interactive children inside the <a>, satisfying WCAG 4.1.3.
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `rgba(${pkg.glowRgb},0.35)`
        e.currentTarget.style.boxShadow = `0 8px 40px rgba(${pkg.glowRgb},0.15)`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Block link — covers the full card surface. Single focusable element. */}
      <a
        href={`/package/${pkg.id}`}
        onClick={e => { e.preventDefault(); handleSelect() }}
        aria-label={`View ${pkg.title} — ${pkg.duration}, starting from ${formatINR(pkg.basePriceAdult)} per adult`}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          // visually invisible but keyboard/pointer accessible
          borderRadius: 'inherit',
          outline: 'none',
        }}
        // Show a focus ring only when using keyboard (not on mouse click)
        onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${pkg.glowRgb},0.6)` }}
        onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
      />

      {/* ── Image ── */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <img
          src={pkg.img}
          alt={pkg.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(11,12,16,0.85) 0%, transparent 55%)',
        }} />

        {/* Badge */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          padding: '3px 10px',
          borderRadius: 99,
          background: badge.bg,
          border: `1px solid ${badge.border}`,
          fontSize: '0.68rem',
          fontWeight: 700,
          color: badge.color,
          letterSpacing: '0.06em',
          fontFamily: 'var(--font-display)',
        }}>
          {pkg.badge}
        </div>

        {/* Rating on image */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 8px',
          borderRadius: 8,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
        }}>
          <Star size={11} fill="#FFD166" color="#FFD166" aria-hidden="true" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{pkg.rating}</span>
          <span className="sr-only">out of 5 stars</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '16px 18px 20px' }}>
        {/* Location + Duration */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <MapPin size={12} color="var(--color-text-muted)" aria-hidden="true" />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{pkg.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={12} color="var(--color-text-muted)" aria-hidden="true" />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{pkg.duration}</span>
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#fff',
          marginBottom: 6,
          letterSpacing: '-0.01em',
        }}>
          {pkg.title}
        </h3>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {pkg.tags.map(tag => (
            <span key={tag} style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: 99,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--color-border)',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-body)',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Price + CTA row — CTA is text-only (no nested button), a11y arrow is decorative */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 1 }}>Starting from</p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.15rem',
              fontWeight: 700,
              color: pkg.glow,
            }}>
              {formatINR(pkg.basePriceAdult)}
              <span className="sr-only"> per adult</span>
            </p>
          </div>
          {/* Decorative "Explore →" label — no interactive role, the block <a> above handles click */}
          <div
            aria-hidden="true"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              background: `rgba(${pkg.glowRgb},0.12)`,
              border: `1px solid rgba(${pkg.glowRgb},0.3)`,
              color: pkg.glow,
              fontSize: '0.82rem',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              pointerEvents: 'none',
            }}
          >
            Explore <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </motion.article>
  )
}
