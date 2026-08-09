// src/pages/Confirmation.jsx
import { useParams, Link } from 'react-router-dom'
import PageMeta from '../components/seo/PageMeta'

export default function Confirmation() {
  const { bookingId } = useParams()
  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center">
      {/* noIndex: booking confirmation pages are for authenticated users only */}
      <PageMeta
        title={`Booking Confirmed${bookingId ? ` \u2014 ${bookingId}` : ''} | Voyage India`}
        description="Your holiday booking with Voyage India is confirmed. Check your email for full details."
        canonicalPath="/confirmation"
        noIndex={true}
      />
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">
          Booking Confirmed
        </h1>
        <p className="font-mono text-marigold-500 text-xl font-medium">{bookingId}</p>
        <p className="font-body text-slate-500 mt-1">Coming in M4</p>
        <Link
          to="/discover"
          className="mt-6 inline-block text-sm text-blue-600 underline"
        >
          Explore more packages
        </Link>
      </div>
    </div>
  )
}
