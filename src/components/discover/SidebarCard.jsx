// src/components/discover/SidebarCard.jsx
// Compact right-panel thumbnail card for the carousel sidebar
import { motion } from 'motion/react'
import { formatINR } from '../../data/packages'
import { Star } from 'lucide-react'

export default function SidebarCard({ pkg, isActive, index, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.97 }}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 10px',
        borderRadius: 14,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.25s ease, box-shadow 0.25s ease',
        background: isActive
          ? 'rgba(255,255,255,0.09)'
          : 'transparent',
        boxShadow: isActive
          ? `0 0 0 1px rgba(${pkg.glowRgb},0.35), 0 4px 20px rgba(${pkg.glowRgb},0.12)`
          : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label={`View ${pkg.title}`}
      aria-pressed={isActive}
    >
      {/* Active left-edge accent bar */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bar"
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: '60%',
            borderRadius: '0 3px 3px 0',
            background: pkg.glow,
            boxShadow: `0 0 8px ${pkg.glow}`,
          }}
        />
      )}

      {/* Thumbnail */}
      <div style={{
        width: 60,
        height: 60,
        borderRadius: 10,
        overflow: 'hidden',
        flexShrink: 0,
        border: isActive ? `1px solid rgba(${pkg.glowRgb},0.4)` : '1px solid rgba(255,255,255,0.08)',
        transition: 'border-color 0.25s ease',
      }}>
        <img
          src={pkg.img}
          alt={pkg.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          loading="lazy"
        />
      </div>

      {/* Text info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
          marginBottom: 3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          transition: 'color 0.2s ease',
        }}>
          {pkg.title}
        </p>
        <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>
          {pkg.duration}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: isActive ? pkg.glow : 'rgba(255,255,255,0.55)',
            fontFamily: 'var(--font-display)',
            transition: 'color 0.2s ease',
          }}>
            {formatINR(pkg.basePriceAdult)}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>/ adult</span>
        </div>
      </div>

      {/* Star rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        <Star size={11} fill={isActive ? pkg.glow : 'rgba(255,255,255,0.3)'}
          color={isActive ? pkg.glow : 'rgba(255,255,255,0.3)'} />
        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          {pkg.rating}
        </span>
      </div>
    </motion.button>
  )
}
