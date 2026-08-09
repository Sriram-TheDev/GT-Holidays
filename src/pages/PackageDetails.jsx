import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '../backend/config/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useBooking } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { calculatePrice } from '../backend/services/pricingEngine'

import { Clock, MapPin, Check, X, Info } from 'lucide-react'
import DateSelector from '../components/DateSelector'
import TravelerSelector from '../components/TravelerSelector'
import PriceSummary from '../components/PriceSummary'
import ItineraryDay from '../components/ItineraryDay'
import PackageMap from '../components/PackageMap'

export default function PackageDetails() {
  const { packageId: id } = useParams()
  const navigate = useNavigate()
  const { setBookingData } = useBooking()
  const { currentUser } = useAuth()
  
  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [selectedDate, setSelectedDate] = useState('')
  const [adults, setAdults] = useState(1)
  const [childrenCount, setChildrenCount] = useState(0)
  const [infants, setInfants] = useState(0)
  
  const [activeDay, setActiveDay] = useState(1) // Map defaults to Day 1

  useEffect(() => {
    async function loadPkg() {
      if (!db) return
      try {
        const snap = await getDoc(doc(db, 'packages', id))
        if (snap.exists()) {
          setPkg({ packageId: snap.id, ...snap.data() })
        }
      } catch (err) {
        console.error("Failed to load package", err)
      } finally {
        setLoading(false)
      }
    }
    loadPkg()
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-paper-50 text-xl font-display text-monsoon-600">Loading experience...</div>
  if (!pkg) return <div className="min-h-screen flex items-center justify-center bg-paper-50 text-xl font-display text-red-500">Package not found</div>

  const handleTravelerChange = (field, val) => {
    if (field === 'adults') setAdults(val)
    if (field === 'children') setChildrenCount(val)
    if (field === 'infants') setInfants(val)
  }

  // Calculate live price
  const priceBreakdown = calculatePrice({
    basePriceAdult: pkg.basePriceAdult,
    childPricePercent: pkg.childPricePercent || 75,
    infantFee: pkg.infantFee || 2000,
    adults,
    children: childrenCount,
    infants,
    promoDiscountPct: 0
  })
  
  const isBookable = selectedDate && adults > 0

  const handleBook = async () => {
    if (!currentUser) {
      // Intercept and prompt Google Login first
      try {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
      } catch (err) {
        console.error('Login failed before checkout:', err)
        alert('You must sign in to book this package.')
        return
      }
    }

    setBookingData({
      packageId: pkg.packageId,
      packageTitle: pkg.title,
      selectedDate,
      adults,
      children: childrenCount,
      infants,
      priceBreakdown
    })
    navigate('/checkout')
  }

  return (
    <div className="min-h-screen bg-white font-body pb-20">
      
      {/* 🖼️ Immersive Hero Gallery (Airbnb Style) */}
      <div className="w-full h-[50vh] md:h-[60vh] relative group bg-ink-900">
        <img 
          src={pkg.images?.[0] || 'https://via.placeholder.com/1200x800'} 
          alt={pkg.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end pb-12">
          <div className="max-w-7xl mx-auto px-6 w-full text-white">
            <div className="flex items-center gap-3 mb-4 text-marigold-500 font-medium">
              <MapPin className="w-5 h-5" />
              <span className="text-lg tracking-wide uppercase">{pkg.country}</span>
            </div>
            <h1 className="font-display font-bold text-4xl md:text-6xl max-w-4xl leading-tight text-white mb-2 shadow-sm drop-shadow-md">
              {pkg.title}
            </h1>
            <div className="flex items-center gap-6 mt-6 text-slate-200">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <Clock className="w-5 h-5 text-white" />
                <span className="font-medium text-white">{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Content & Itinerary */}
          <div className="lg:col-span-7 xl:col-span-8">
            
            <section className="mb-12">
              <h2 className="font-display font-bold text-2xl text-ink-900 mb-4 tracking-tight">Overview</h2>
              <p className="text-slate-600 text-lg leading-relaxed font-light">
                {pkg.description}
              </p>
            </section>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 bg-paper-50 p-8 rounded-3xl border border-line-200/60">
              <div>
                <h3 className="font-display font-bold text-lg text-ink-900 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 bg-green-100 rounded-full p-0.5" /> What's Included
                </h3>
                <ul className="space-y-3">
                  {pkg.inclusions?.map((inc, i) => (
                    <li key={i} className="flex items-start text-slate-600 text-sm">
                      <span className="mr-2 text-green-500">•</span> {inc}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-ink-900 mb-4 flex items-center gap-2">
                  <X className="w-5 h-5 text-red-600 bg-red-100 rounded-full p-0.5" /> What to Expect
                </h3>
                <ul className="space-y-3">
                  {pkg.exclusions?.map((exc, i) => (
                    <li key={i} className="flex items-start text-slate-600 text-sm">
                      <span className="mr-2 text-red-400">•</span> {exc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display font-bold text-3xl text-ink-900 tracking-tight">Detailed Itinerary</h2>
                <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <Info className="w-4 h-4" /> Tap to view on map
                </div>
              </div>
              
              <div className="space-y-2">
                {pkg.itinerary?.sort((a,b) => a.dayNumber - b.dayNumber).map(day => (
                  <ItineraryDay 
                    key={day.dayNumber}
                    day={day} 
                    isActive={activeDay === day.dayNumber}
                    onClick={() => setActiveDay(activeDay === day.dayNumber ? null : day.dayNumber)}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: Sticky Booking Panel & Live Map */}
          <div className="lg:col-span-5 xl:col-span-4 relative">
            <div className="sticky top-8 space-y-6">
              
              {/* Dynamic Map - Sticky! */}
              <div className="bg-white rounded-3xl border border-line-200 overflow-hidden shadow-sm h-[300px]">
                {pkg.itinerary && (
                  <PackageMap itinerary={pkg.itinerary} activeDayNumber={activeDay} />
                )}
              </div>

              {/* Booking Configuration Card */}
              <div className="bg-white rounded-3xl border border-line-200 p-6 shadow-xl shadow-ink-900/5">
                <h3 className="font-display font-bold text-xl text-ink-900 mb-6">Configure Your Trip</h3>
                
                <DateSelector 
                  availableDates={pkg.availableDates}
                  selectedDate={selectedDate}
                  onSelect={setSelectedDate}
                />
                
                <TravelerSelector 
                  adults={adults}
                  children={childrenCount}
                  infants={infants}
                  onChange={handleTravelerChange}
                />

                <div className="mt-8">
                  <PriceSummary 
                    priceBreakdown={priceBreakdown}
                    disabled={!isBookable}
                    onBookClick={handleBook}
                  />
                  {!selectedDate && (
                    <p className="text-center text-sm text-red-500 mt-3 font-medium">Please select a date to proceed.</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
