/**
 * src/tokens/designTokens.js
 * ─────────────────────────────────────────────────────────────────
 * Single source of truth for the GT Holidays design system.
 * These values MIRROR what is defined in src/index.css @theme block.
 * Use these in JS/GSAP animations where CSS variables aren't accessible.
 * ─────────────────────────────────────────────────────────────────
 */

// ── Core Backgrounds ──────────────────────────────────────────────
export const COLOR_BASE       = '#0B0C10'  // page background
export const COLOR_SURFACE    = '#111318'  // card surfaces
export const COLOR_SURFACE_2  = '#1A1D26'  // elevated / modals
export const COLOR_SURFACE_3  = '#22263A'  // deepest glass layers

// ── Borders & Dividers ────────────────────────────────────────────
export const COLOR_BORDER     = 'rgba(255, 255, 255, 0.08)'
export const COLOR_BORDER_MED = 'rgba(255, 255, 255, 0.14)'

// ── Text ──────────────────────────────────────────────────────────
export const COLOR_TEXT_PRIMARY   = '#FFFFFF'
export const COLOR_TEXT_SECONDARY = 'rgba(255, 255, 255, 0.55)'
export const COLOR_TEXT_MUTED     = 'rgba(255, 255, 255, 0.30)'

// ── Accent Glows (package type → glow color) ─────────────────────
export const COLOR_ACCENT_GREEN  = '#00FFA3'  // nature / adventure
export const COLOR_ACCENT_BLUE   = '#3D9BFF'  // beach / water / coastal
export const COLOR_ACCENT_PURPLE = '#B069FF'  // luxury / culture / heritage
export const COLOR_ACCENT_ORANGE = '#FF7A30'  // desert / temples / wildlife
export const COLOR_ACCENT_GOLD   = '#FFD166'  // premium / tier-1

// ── Primary CTA ───────────────────────────────────────────────────
export const COLOR_CTA          = '#00FFA3'   // Book Now / primary buttons
export const COLOR_CTA_HOVER    = '#00E594'
export const COLOR_CTA_TEXT     = '#0B0C10'   // dark text on bright CTA

// ── Package Type → Glow Color Map ─────────────────────────────────
export const PACKAGE_GLOW_MAP = {
  beach:      COLOR_ACCENT_BLUE,
  coastal:    COLOR_ACCENT_BLUE,
  adventure:  COLOR_ACCENT_GREEN,
  nature:     COLOR_ACCENT_GREEN,
  wildlife:   COLOR_ACCENT_ORANGE,
  desert:     COLOR_ACCENT_ORANGE,
  heritage:   COLOR_ACCENT_PURPLE,
  culture:    COLOR_ACCENT_PURPLE,
  luxury:     COLOR_ACCENT_GOLD,
  default:    COLOR_ACCENT_GREEN,
}

/**
 * Returns the glow color hex for a given package type tag.
 * @param {string} tag - e.g. 'beach', 'adventure', 'luxury'
 * @returns {string} hex color
 */
export function getGlowForTag(tag = '') {
  const key = tag.toLowerCase()
  return PACKAGE_GLOW_MAP[key] ?? PACKAGE_GLOW_MAP.default
}

// ── Typography ────────────────────────────────────────────────────
export const FONT_DISPLAY = "'Space Grotesk', sans-serif"
export const FONT_BODY    = "'Inter', sans-serif"
export const FONT_MONO    = "'JetBrains Mono', monospace"

// ── Spacing Scale ─────────────────────────────────────────────────
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '40px',
  '2xl': '64px',
  '3xl': '96px',
}

// ── Border Radius ─────────────────────────────────────────────────
export const RADIUS = {
  sm:   '8px',
  md:   '12px',
  lg:   '16px',
  xl:   '24px',
  '2xl':'32px',
  full: '9999px',
}

// ── Shadows / Glows ───────────────────────────────────────────────
export const GLASS_SHADOW = '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.08)'

export function buildGlowShadow(color, intensity = 0.35) {
  return `0 0 60px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}, 0 0 120px ${color}${Math.round(intensity * 0.5 * 255).toString(16).padStart(2, '0')}`
}

// ── GSAP Easing Presets ───────────────────────────────────────────
export const EASE_OUT_EXPO  = 'expo.out'
export const EASE_OUT_QUART = 'quart.out'
export const EASE_IN_OUT    = 'power2.inOut'

// ── Animation Durations ───────────────────────────────────────────
export const DUR_FAST   = 0.25  // micro-interactions
export const DUR_NORMAL = 0.45  // standard transitions
export const DUR_SLOW   = 0.75  // hero entrances
export const DUR_DRAWER = 0.55  // side drawers / overlays
