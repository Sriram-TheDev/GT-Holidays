// src/utils/index.js
// ─────────────────────────────────────────────────────────────────
// Shared utility functions across the GT Holidays app.
// ─────────────────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupees (INR).
 * @param {number} amount - amount in INR
 * @param {boolean} [compact=false] - use compact notation (e.g. ₹1.2L)
 */
export function formatINR(amount, compact = false) {
  if (compact && amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(1)}L`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Returns a debounced version of fn.
 */
export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Returns true if the user prefers reduced motion.
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Generates a slug from a string.
 * @param {string} str
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Returns the ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/**
 * Deep merge two objects (shallow arrays overwritten).
 */
export function deepMerge(target, source) {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] ?? {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

/**
 * Wait for N milliseconds (Promise-based).
 */
export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
