import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../backend/config/firebase'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { Map, Clock, ArrowRight, Compass, Ticket, CheckCircle, AlertCircle } from 'lucide-react'
import { motion } from 'motion/react'
import PageMeta from '../components/seo/PageMeta'

export default function MyTrips() {
  const { currentUser } = useAuth()
  const { state } = useBooking()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTrips() {
      if (!currentUser || !db) {
        setLoading(false)
        return
      }

      try {
        const q = query(
          collection(db, 'bookings'),
          where('uid', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        const userTrips = snap.docs.map(d => ({
          bookingId: d.id,
          ...d.data()
        }))
        
        // Merge the backend trips with local simulated trips from BookingContext
        const combined = [...(state.myTrips || []), ...userTrips]
        
        // Attempt to remove duplicates by bookingId just in case
        const uniqueTrips = Array.from(new Map(combined.map(item => [item.bookingId, item])).values())
        
        setTrips(uniqueTrips)
      } catch (err) {
        console.error('Failed to load trips:', err)
        // Fallback to purely local state if firestore fails
        setTrips(state.myTrips || [])
      } finally {
        setLoading(false)
      }
    }
    loadTrips()
  }, [currentUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-white" style={{ background: 'var(--color-base)' }}>
        <div className="animate-spin w-8 h-8 border-4 border-t-white/80 border-white/20 rounded-full" />
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: 'var(--color-base)' }}>
        <Map className="w-16 h-16 text-white/20 mb-4" />
        <h2 className="text-2xl font-display font-medium text-white mb-2">Sign in to view your trips</h2>
        <p className="text-white/50 max-w-md mx-auto mb-6">You need to sign in with your account to access your booking library.</p>
        <Link to="/auth" className="btn-cta px-6 py-3 rounded-xl">Go to Sign In</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full font-body pt-28 pb-12 relative overflow-x-hidden" style={{ background: 'var(--color-base)' }}>
      {/* noIndex: user library is private and should not be crawled */}
      <PageMeta
        title="My Trips | Voyage India"
        description="View and manage your booked holiday packages and upcoming adventures."
        canonicalPath="/my-trips"
        noIndex={true}
      />
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 10%, rgba(61,155,255,0.08) 0%, transparent 80%)', zIndex: 0 }} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 w-full">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display font-bold text-4xl text-white tracking-tight flex items-center gap-3">
            <Ticket className="text-[var(--color-accent-blue)]" size={32} />
            Library
          </h1>
          <p className="text-white/50 text-lg mt-2">Your collection of past and upcoming adventures.</p>
        </motion.div>

        {trips.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-12 text-center border mt-8 flex flex-col items-center" 
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
              <Compass className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-2xl font-display font-semibold text-white mb-2">Library Empty</h3>
            <p className="text-white/50 mb-8 max-w-md">You haven't booked any packages yet. Your next adventure awaits.</p>
            <Link to="/discover" className="btn-cta px-8 py-3 rounded-xl transition-transform hover:scale-105" style={{ borderRadius: '12px' }}>
              Browse Store
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {trips.map((trip, idx) => {
              const isConfirmed = trip.status === 'confirmed'
              const statusColor = isConfirmed ? '#00FFA3' : '#FFD166'
              
              return (
                <motion.div 
                  key={trip.bookingId} 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-3xl overflow-hidden group flex flex-col relative"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
                >
                  {/* Card Header / Artwork */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#12141C]">
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-2)] via-transparent to-black/30 z-10" />
                    
                    {/* Artwork Placeholder / Simulation */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 group-hover:opacity-30 transition-all duration-700 ease-out">
                      {trip.packageData?.img ? (
                         <img src={trip.packageData.img} alt={trip.packageTitle} className="w-full h-full object-cover" />
                      ) : (
                         <Compass size={64} className="text-white" />
                      )}
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', border: `1px solid ${statusColor}40` }}>
                      {isConfirmed ? <CheckCircle size={12} color={statusColor}/> : <AlertCircle size={12} color={statusColor} />}
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {trip.status}
                      </span>
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-4 left-5 right-5 z-20">
                       <h3 className="font-display font-bold text-2xl text-white truncate drop-shadow-md" title={trip.packageTitle}>{trip.packageTitle}</h3>
                       <p className="text-white/60 text-[0.8rem] font-mono mt-1 tracking-wide">ID: {trip.bookingId.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-white/70 mb-5 justify-between">
                      <div className="flex items-center gap-2 text-sm bg-white/5 px-3 py-1.5 rounded-lg border" style={{ borderColor: 'var(--color-border-med)' }}>
                        <Clock size={15} className="text-[#3D9BFF]" />
                        {trip.date}
                      </div>
                      <div className="font-display font-semibold text-lg text-white">
                        ₹{trip.priceBreakdown?.totalPayable?.toLocaleString() || trip.amount?.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Meta info (like travelers) */}
                    {trip.travelers && (
                      <div className="flex items-center gap-4 mb-6 text-sm text-white/40">
                         <span>{trip.travelers.adults + trip.travelers.children} Travelers</span>
                      </div>
                    )}
                    
                    <div className="mt-auto">
                      <Link to={`/confirmation/${trip.bookingId}`} 
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-200"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      >
                        View Itinerary <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

