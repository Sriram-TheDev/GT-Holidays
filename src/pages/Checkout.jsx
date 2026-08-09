// src/pages/Checkout.jsx
import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useBooking, FOOD_PREFS } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { motion } from 'motion/react'
import { ShieldCheck, Tag, Plus, Minus, Info, Lock } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import PageMeta from '../components/seo/PageMeta'

// Dummy URL for functions since this is local dev for now
// import { httpsCallable } from 'firebase/functions'
// import { functions } from '../backend/config/firebase'

// const createOrderFn = httpsCallable(functions, 'createRazorpayOrder')
// const verifyPaymentFn = httpsCallable(functions, 'verifyRazorpayPayment')

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Checkout() {
  const { state, dispatch } = useBooking()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [contact, setContact] = useState({ name: currentUser?.displayName || '', phone: '' })
  const [promoInput, setPromoInput] = useState(state.promoCode || '')
  const [promoError, setPromoError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Force a selectedDate if missing
  useEffect(() => {
    if (state.selectedPackage && !state.selectedDate?.date) {
      dispatch({ type: 'SET_DATE', payload: { date: new Date().toISOString().split('T')[0], status: 'available' } })
    }
  }, [state.selectedPackage, state.selectedDate, dispatch])

  // Need priceBreakdown to be evaluated if not already
  useEffect(() => {
    if (state.selectedPackage && !state.priceBreakdown) {
      dispatch({ type: 'SET_TRAVELERS', payload: {} }) 
    }
  }, [state.priceBreakdown, state.selectedPackage, dispatch])

  if (!state.selectedPackage) {
    return <Navigate to="/" replace />
  }

  const { selectedPackage, selectedDate, travelers, priceBreakdown } = state
  const totalPax = travelers.adults + travelers.children
  const glow = selectedPackage.glow || '#3D9BFF'

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!contact.name || !contact.phone) {
      setError('Please provide traveler contact details.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await loadRazorpay()
      if (!res) throw new Error('Razorpay SDK failed to load. Are you online?')

      // For local development testing, bypass the Firebase Cloud Function
      // and use client-side only Razorpay checkout (Legacy Direct mode)
      const mockBookingId = 'BKG-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy_key', 
        amount: Math.round(priceBreakdown.finalTotal * 100).toString(), // Convert to paise
        currency: 'INR',
        name: 'Voyage India',
        description: `Booking: ${selectedPackage.title}`,
        // Omitting order_id allows client-side test payments
        handler: async function (response) {
          try {
            // Simulate successful backend verification
            console.log('Payment successful:', response)
            
            // Dispatch to save in local context buffer 
            dispatch({ type: 'CONFIRM_BOOKING', payload: { bookingId: mockBookingId } })
            
            // Show Success Modal instead of navigating instantly
            setShowSuccessModal(true)
            
            setTimeout(() => {
              dispatch({ type: 'RESET' })
              navigate('/my-trips', { replace: true })
            }, 3000)
            
          } catch (err) {
            console.error(err)
            setError('Error verifying payment.')
          }
        },
        prefill: {
          name: contact.name,
          email: currentUser?.email || 'test@voyageindia.in',
          contact: contact.phone || '9999999999'
        },
        theme: { color: glow }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.on('payment.failed', function (response) {
        setError(response.error.description)
      })
      paymentObject.open()
    } catch (err) {
      console.error(err)
      setError(err.message || 'An error occurred during checkout.')
    } finally {
      setLoading(false)
    }
  }

  const applyPromo = () => {
    setPromoError('')
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    if (code === 'VOYAGE10') {
      dispatch({ type: 'APPLY_PROMO', payload: { code, discountPct: 10 } })
    } else if (code === 'VOYAGE20') {
      dispatch({ type: 'APPLY_PROMO', payload: { code, discountPct: 20 } })
    } else {
      setPromoError('Invalid code.')
    }
  }

  const toggleMeal = (meal) => dispatch({ type: 'TOGGLE_MEAL_PLAN', payload: meal })
  const setMealType = (type) => dispatch({ type: 'SET_MEAL_TYPE', payload: type })

  const updateTravelers = (type, val) => {
    dispatch({ type: 'SET_TRAVELERS', payload: { [type]: travelers[type] + val } })
  }

  if (!priceBreakdown) return <div className="text-white text-center py-20">Loading...</div>

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] font-body pt-24 pb-12 text-white/90">
      {/* noIndex: transactional checkout page — not useful for search engines */}
      <PageMeta
        title={`Checkout — ${selectedPackage.title} | Voyage India`}
        description={`Complete your booking for ${selectedPackage.title} — ${selectedPackage.duration} in ${selectedPackage.location}.`}
        canonicalPath="/checkout"
        noIndex={true}
      />
      <div className="w-full max-w-[1240px] mx-auto px-4 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        
        {/* ── LEFT COLUMN: ORDER SUMMARY ── */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-8"
        >
          <div className="flex items-center gap-4 border-b border-[#222] pb-6">
            <h1 className="text-2xl font-semibold text-white tracking-tight">Order Summary</h1>
            <span className="text-xs bg-[#1A1A1A] px-2.5 py-1 rounded-md text-white/60 border border-[#333]">
              1 package
            </span>
          </div>

          <div className="bg-[#111111] p-4 rounded-2xl border border-[#222] flex gap-5 items-stretch relative group transition-colors hover:border-[#333]">
            <img
              src={selectedPackage.img}
              alt={`${selectedPackage.title} package cover`}
              className="w-24 h-24 object-cover rounded-xl border border-white/5"
            />
            <div className="flex-1 flex flex-col pt-1">
              <h3 className="font-medium text-white/95 text-lg leading-tight">{selectedPackage.title}</h3>
              <input 
                type="date" 
                value={selectedDate?.date || ''}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => dispatch({ type: 'SET_DATE', payload: { date: e.target.value, status: 'available' } })}
                className="bg-transparent text-sm text-white/50 mt-1 focus:outline-none border-b border-transparent hover:border-white/10 focus:border-white/30 cursor-pointer transition-colors w-fit pb-1"
              />
              
              <div className="flex items-center gap-2 mt-auto text-xs text-white/60">
                <span className="bg-white/5 px-2 py-1 rounded-md">{totalPax} Travelers</span>
                <span className="bg-white/5 px-2 py-1 rounded-md">{travelers.infants} Infants</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end pt-1 gap-1.5 ml-auto pl-4 border-l border-white/5">
              <p className="font-medium text-white mb-1">₹{priceBreakdown.adultTotal.toLocaleString()}</p>
              
              <div className="flex items-center justify-between w-full gap-4">
                <span className="text-[10px] text-white/50 uppercase tracking-wide">Adults</span>
                <div className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#222] rounded p-0.5">
                  <button onClick={() => updateTravelers('adults', -1)} className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded"><Minus size={12} /></button>
                  <span className="text-[11px] font-semibold w-3 text-center">{travelers.adults}</span>
                  <button onClick={() => updateTravelers('adults', 1)} className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded"><Plus size={12} /></button>
                </div>
              </div>

              <div className="flex items-center justify-between w-full gap-4">
                <span className="text-[10px] text-white/50 uppercase tracking-wide">Children</span>
                <div className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#222] rounded p-0.5">
                  <button onClick={() => updateTravelers('children', -1)} className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded"><Minus size={12} /></button>
                  <span className="text-[11px] font-semibold w-3 text-center">{travelers.children}</span>
                  <button onClick={() => updateTravelers('children', 1)} className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded"><Plus size={12} /></button>
                </div>
              </div>

              <div className="flex items-center justify-between w-full gap-4">
                <span className="text-[10px] text-white/50 uppercase tracking-wide">Infants</span>
                <div className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#222] rounded p-0.5">
                  <button onClick={() => updateTravelers('infants', -1)} className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded"><Minus size={12} /></button>
                  <span className="text-[11px] font-semibold w-3 text-center">{travelers.infants}</span>
                  <button onClick={() => updateTravelers('infants', 1)} className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded"><Plus size={12} /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Discount Block */}
          <div className="bg-[#121415] rounded-xl border border-blue-500/10 p-5 flex items-center justify-between shadow-[inset_0_0_20px_rgba(61,155,255,0.02)]">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                <Tag size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">Discount code</p>
                <p className="text-xs text-blue-400/80">Save 10% with VOYAGE10</p>
              </div>
            </div>
            {!state.promoApplied ? (
              <div className="flex gap-2">
                <input 
                  type="text" value={promoInput} onChange={e => setPromoInput(e.target.value)}
                  placeholder="Code" className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500/50 uppercase"
                />
                <button onClick={applyPromo} className="px-3 py-1.5 border border-white/10 rounded-lg text-xs font-medium hover:bg-white/5 transition">
                  Add code
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { dispatch({ type: 'REMOVE_PROMO' }); setPromoInput(''); }}
                className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium hover:bg-blue-500/20"
              >
                {state.promoCode} Applied
              </button>
            )}
          </div>
          {promoError && <p className="text-red-400/80 text-xs text-right -mt-4 pr-1">{promoError}</p>}

          {/* Meal Add-ons Block */}
          <div className="bg-[#121415] rounded-xl border border-[#222] p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-center bg-[#1A1A1A] p-1 rounded-lg border border-[#2C2C2C]">
              <button 
                onClick={() => setMealType('veg')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${state.mealType === 'veg' ? 'bg-[#2C2C2C] text-emerald-400 shadow-sm' : 'text-white/40 hover:text-white/80'}`}
              >
                Vegetarian
              </button>
              <button 
                onClick={() => setMealType('non-veg')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${state.mealType === 'non-veg' ? 'bg-[#2C2C2C] text-orange-400 shadow-sm' : 'text-white/40 hover:text-white/80'}`}
              >
                Non-Vegetarian (+₹300/meal)
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'breakfast', label: 'Breakfast', price: 500 },
                { id: 'lunch', label: 'Lunch', price: 800 },
                { id: 'dinner', label: 'Dinner', price: 900 }
              ].map(meal => (
                <button
                  key={meal.id}
                  onClick={() => toggleMeal(meal.id)}
                  className={`flex-1 min-w-[100px] flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    state.mealPlan[meal.id] 
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm font-medium">{meal.label}</span>
                  <span className="text-xs opacity-70">+₹{meal.price}/pax</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-[#222] text-sm text-white/60">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white">₹{priceBreakdown.subtotal.toLocaleString()}</span>
            </div>
            {priceBreakdown.mealTotal > 0 && (
              <div className="flex justify-between text-blue-400">
                <span>Meal Add-ons</span>
                <span>+₹{priceBreakdown.mealTotal.toLocaleString()}</span>
              </div>
            )}
            {priceBreakdown.discountAmt > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span>
                <span>-₹{priceBreakdown.discountAmt.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="flex items-center gap-1">Tax <Info size={12} className="text-white/30" /></span>
              <span className="text-white">₹{priceBreakdown.tax.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-6 border-t border-[#222]">
            <span className="text-lg font-medium text-white">Total</span>
            <span className="text-2xl font-semibold text-white">₹{priceBreakdown.finalTotal.toLocaleString()}</span>
          </div>

        </motion.div>


        {/* ── RIGHT COLUMN: CONTACT & PAYMENT ── */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Traveler Info */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-white tracking-tight mb-4">Traveler Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/50 mb-1.5 ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={contact.name}
                  onChange={e => setContact({ ...contact, name: e.target.value })}
                  placeholder="Primary Traveler Name"
                  className="w-full bg-[#1A1A1A] border border-[#2C2C2C] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5 ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={contact.phone}
                  onChange={e => setContact({ ...contact, phone: e.target.value })}
                  placeholder="Primary Phone Number"
                  className="w-full bg-[#1A1A1A] border border-[#2C2C2C] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#222]">
            <h2 className="text-xl font-semibold text-white tracking-tight">Payment Details</h2>
            <div className="flex items-center gap-2 text-xs text-emerald-500/80 font-medium bg-emerald-500/5 py-1.5 px-3 rounded-lg border border-emerald-500/10 w-fit">
              <Lock size={12} /> Secure Razorpay Checkout
            </div>
          </div>

          {error && <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-xl text-sm border border-red-500/20">{error}</div>}
          
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
            
            {/* Contact Details mimicking card form */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">Email address</label>
              <input 
                type="email" 
                value={currentUser?.email || ''} 
                disabled
                className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white/50 focus:outline-none transition-colors cursor-not-allowed text-sm" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">Full name</label>
              <input 
                type="text" 
                value={contact.name}
                onChange={e => setContact({...contact, name: e.target.value})}
                className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#444] transition-colors text-sm" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-white/50 mb-2">Phone Number</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    value={contact.phone}
                    onChange={e => setContact({...contact, phone: e.target.value})}
                    placeholder="+91"
                    className="w-full bg-[#111] border border-[#222] rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-[#444] transition-colors text-sm tracking-wide" 
                    required 
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-5 h-3 bg-white/10 rounded-sm"></div>
                    <div className="w-5 h-3 bg-white/10 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <label className="block text-xs font-medium text-white/50 mb-2">Billing address</label>
              <input 
                type="text"
                placeholder="Address line 1"
                className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#444] transition-colors text-sm mb-3" 
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input 
                  type="text" placeholder="City"
                  className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#444] transition-colors text-sm" 
                />
                <input 
                  type="text" placeholder="State/Province"
                  className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#444] transition-colors text-sm" 
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#222]">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-white/60">Subtotal</span>
                <span className="text-white">₹{priceBreakdown.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium pb-4">
                <span className="text-white/60">Total</span>
                <span className="text-white text-lg">₹{priceBreakdown.finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="relative w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.2)]"
            >
              {loading ? 'Processing...' : `Pay ₹${priceBreakdown.finalTotal.toLocaleString()}`}
              <Lock size={16} className={loading ? 'hidden' : 'absolute right-4 opacity-50'} />
            </button>
            <p className="text-center text-xs text-white/30 pt-2">Powered by Razorpay · Terms · Privacy</p>

          </form>
        </motion.div>
        
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#121212] border border-emerald-500/20 p-10 rounded-3xl flex flex-col items-center max-w-sm text-center shadow-[0_0_80px_rgba(16,185,129,0.15)] relative overflow-hidden"
            >
              {/* Background glow behind icon */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />

              <div className="relative w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                <ShieldCheck size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Payment Successful!</h2>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">
                Your package has been successfully purchased. Get ready for your next adventure starting <span className="font-semibold text-white/90">{state.selectedDate?.date}</span>!
              </p>
              
              <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: '100%' }} 
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-full bg-emerald-500 rounded-full" 
                />
              </div>
              <p className="text-xs text-emerald-500/70 mt-4 tracking-widest uppercase font-semibold">Redirecting to Library...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
