// src/components/seo/PageMeta.jsx
// ─────────────────────────────────────────────────────────────────
// Reusable SEO meta-tag component using react-helmet-async.
//
// Why react-helmet-async (not react-helmet)?
//   • react-helmet is unmaintained and has race conditions in React 18
//     concurrent mode (StrictMode double-render corrupts title).
//   • react-helmet-async fixes this with a thread-safe context provider.
//
// Usage:
//   <PageMeta
//     title="Kerala Backwaters | Voyage India"
//     description="5-day houseboat cruise..."
//     image="/packages/kerala.png"
//     canonicalPath="/package/kerala-backwaters"
//   />
//
// The <HelmetProvider> must wrap the entire app — see main.jsx.
// ─────────────────────────────────────────────────────────────────
import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Voyage India'
const BASE_URL  = 'https://voyageindia.in'   // ← update to your verified domain

/**
 * @param {object} props
 * @param {string}  props.title         Full page title. Keep under 60 chars.
 * @param {string}  props.description   Meta description. Keep 120-160 chars.
 * @param {string}  [props.image]       Absolute or root-relative image path for OG/Twitter card.
 * @param {string}  [props.canonicalPath] Root-relative path, e.g. "/package/kerala-backwaters".
 *                                      Defaults to "/" if omitted.
 * @param {'website'|'article'} [props.ogType] Open Graph type. Default: 'website'.
 * @param {boolean} [props.noIndex]     If true, adds `noindex, nofollow` robots tag.
 *                                      Use on auth, confirmation, and admin pages.
 */
export default function PageMeta({
  title,
  description,
  image,
  canonicalPath = '/',
  ogType = 'website',
  noIndex = false,
}) {
  // Ensure canonical URL is always absolute
  const canonicalUrl = `${BASE_URL}${canonicalPath}`

  // Resolve image to absolute URL
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : `${BASE_URL}${image}`
    : `${BASE_URL}/og-default.png`

  return (
    <Helmet>
      {/* ── Primary SEO ── */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow, max-image-preview:large" />
      }

      {/* ── Canonical URL ── */}
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Open Graph (Facebook, LinkedIn, WhatsApp previews) ── */}
      <meta property="og:type"        content={ogType} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:title"       content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale"      content="en_IN" />

      {/* ── Twitter / X Card ── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />

      {/* ── Geo targeting (Indian travel site) ── */}
      <meta name="geo.region"   content="IN" />
      <meta name="geo.placename" content="India" />
    </Helmet>
  )
}
