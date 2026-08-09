import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithPopup, GoogleAuthProvider,
  signInWithEmailAndPassword, createUserWithEmailAndPassword
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../backend/config/firebase'
import { useAuth } from '../context/AuthContext'
import { Loader2, Mail, Lock, User, Plane, CheckCircle2 } from 'lucide-react'
import { motion } from 'motion/react'
import PageMeta from '../components/seo/PageMeta'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

async function checkIsNewUser(uid) {
  if (!db) return true
  const snap = await getDoc(doc(db, 'users', uid))
  return !snap.exists()
}

async function saveUserProfile(uid, data) {
  if (!db) return
  await setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

function friendlyError(code) {
  const map = {
    'auth/invalid-email':       'Please enter a valid email address.',
    'auth/user-not-found':      'No account found with this email.',
    'auth/wrong-password':      'Incorrect password. Try again.',
    'auth/email-already-in-use':'An account with this email already exists.',
    'auth/weak-password':       'Password must be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-credential':  'Invalid email or password.',
  }
  return map[code] || 'Something went wrong. Please try again.'
}

export default function AuthPage() {
  const { currentUser, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const clearError = () => setError(null)

  useEffect(() => {
    if (!authLoading && currentUser) navigate('/discover', { replace: true })
  }, [currentUser, authLoading, navigate])

  // --- Auth Actions ---
  const handleGoogle = async (e) => {
    e.preventDefault();
    if (!auth) { setError('Firebase not configured.'); return }
    setLoading(true); clearError()
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const isNew = await checkIsNewUser(result.user.uid)
      if (isNew) {
        await saveUserProfile(result.user.uid, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          isNewUser: true,
        })
      }
      navigate('/discover', { replace: true })
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError(friendlyError(err.code))
    } finally { setLoading(false) }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!auth) { setError('Firebase not configured.'); return }
    setLoading(true); clearError()
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await saveUserProfile(cred.user.uid, {
          uid: cred.user.uid,
          email,
          displayName: email.split('@')[0],
          createdAt: serverTimestamp(),
          isNewUser: true,
        })
      }
      navigate('/discover', { replace: true })
    } catch (err) {
      setError(friendlyError(err.code))
    } finally { setLoading(false) }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F1218] flex items-center justify-center">
        <Loader2 size={32} className="text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#0F1218] text-white font-sans selection:bg-blue-600/30">
      {/* noIndex: auth pages must not appear in Google results */}
      <PageMeta
        title={isLogin ? 'Sign In | Voyage India' : 'Create Account | Voyage India'}
        description="Sign in or create your Voyage India account to manage bookings, build itineraries, and earn Travel XP."
        canonicalPath="/auth"
        noIndex={true}
      />
      
      {/* ── LEFT SIDE: Immersive Scene ── */}
      <div className="hidden lg:flex relative flex-col justify-center p-16 overflow-hidden bg-[#0A0D14]">
        {/* Abstract Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none transition-all duration-1000" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop')", filter: isLogin ? 'hue-rotate(0deg)' : 'hue-rotate(45deg)' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1218]/80 via-transparent to-[#0F1218] z-10" />
        
        {/* Logo Top Left */}
        <div className="absolute top-10 left-10 flex items-center gap-3 z-20">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
            <Plane size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-xl tracking-wide select-none">Voyage India</span>
        </div>

        <div className="relative z-20 max-w-lg mt-12 select-none">
          {/* Mock Player Card */}
          <div className="bg-[#151921]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl mb-12 transform transition-transform hover:scale-[1.02] duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                  <User size={24} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-white font-semibold text-[17px] leading-tight">
                    {isLogin ? 'Returning Explorer' : 'New Explorer'}
                  </h3>
                  <p className="text-white/40 text-sm mt-0.5 font-medium">Level {isLogin ? '42' : '0'}</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-[5px] bg-blue-600/10 text-blue-500 text-[10px] font-bold tracking-widest uppercase border border-blue-500/20">
                {isLogin ? 'Ready' : 'Initializing'}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-[11px] text-white/50 mb-2.5 font-medium tracking-wide">
                <span>Experience</span>
                <span className="text-blue-400 font-mono tracking-wider">{isLogin ? '4,250' : '0'} / 10,000 XP</span>
              </div>
              <div className="w-full h-1.5 bg-[#0A0D14] rounded-full overflow-hidden mb-5 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: isLogin ? '42.5%' : '0%' }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,1)]" 
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                   <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                   <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                </div>
                <span className="text-white/40 text-[11px]">
                  {isLogin ? 'Stats loaded successfully.' : 'Stats loading...'}
                </span>
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <h1 className="text-[3.25rem] font-bold text-white leading-[1.05] mb-5 tracking-[-0.02em]">
            Your travel journey <br />
            <span className="text-blue-500 transition-colors duration-500">{isLogin ? 'continues here.' : 'starts here.'}</span>
          </h1>
          <p className="text-white/40 text-lg leading-relaxed max-w-[420px]">
            Manage bookings, build perfect itineraries, and gain Travel XP. Turn your next vacation into a legendary adventure.
          </p>
        </div>
      </div>

      {/* ── RIGHT SIDE: Auth Form ── */}
      <div className="flex flex-col justify-center items-center px-6 py-12 sm:p-12 bg-[#0F1218] min-h-screen relative z-10">
        <div className="w-full max-w-[400px]">
          
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2.5 tracking-tight transition-all duration-300">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-white/40 text-[15px]">
              {isLogin ? 'Ready to continue your quest?' : 'Join the premium travel ecosystem.'}
            </p>
          </div>

          {/* Animated Tabs */}
          <div className="flex w-full border-b border-white/5 mb-8 relative">
            <button 
              onClick={() => { setIsLogin(true); clearError() }} 
              className={`flex-1 pb-4 text-[15px] font-medium transition-colors ${isLogin ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setIsLogin(false); clearError() }} 
              className={`flex-1 pb-4 text-[15px] font-medium transition-colors ${!isLogin ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              Sign Up
            </button>
            
            {/* Blue Underline Indicator */}
            <div 
              className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: '50%', left: isLogin ? '0%' : '50%' }}
            />
          </div>

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Email Address</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="email" 
                  value={email} onChange={e => {setEmail(e.target.value); clearError()}}
                  placeholder="hero@example.com" 
                  className="w-full bg-[#161B22] border border-[#232934] rounded-xl py-3.5 pl-11 pr-4 text-white text-[15px] focus:outline-none focus:border-blue-500/50 focus:bg-[#1A1F28] transition-all placeholder:text-white/20 shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Password</label>
                {isLogin && <a href="#" className="text-xs text-blue-500 font-medium hover:text-blue-400 transition-colors">Forgot password?</a>}
              </div>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="password" 
                  value={password} onChange={e => {setPassword(e.target.value); clearError()}}
                  placeholder="••••••••" 
                  className="w-full bg-[#161B22] border border-[#232934] rounded-xl py-3.5 pl-11 pr-4 text-white text-[15px] tracking-[0.1em] focus:outline-none focus:border-blue-500/50 focus:bg-[#1A1F28] transition-all placeholder:text-white/20 shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Checkbox */}
            {isLogin && (
              <label className="flex items-center gap-3 mt-1.5 cursor-pointer group w-fit">
                <div className="relative flex items-center justify-center w-5 h-5">
                   <input type="checkbox" className="peer appearance-none w-5 h-5 bg-[#161B22] border border-[#232934] rounded-[5px] cursor-pointer checked:bg-blue-600 checked:border-blue-600 transition-all shadow-inner" />
                   <CheckCircle2 size={14} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                </div>
                <span className="text-sm text-white/40 group-hover:text-white/60 select-none transition-colors">Keep me logged in to the realm</span>
              </label>
            )}

            {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl mt-1">{error}</div>}

            <button type="submit" disabled={loading} className="w-full py-4 mt-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-[15px] transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50">
               {loading && <Loader2 size={18} className="animate-spin" />}
               {isLogin ? 'Enter World' : 'Create Character'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[11px] text-white/30 uppercase tracking-widest font-semibold">Or Continue With</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Socials */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={handleGoogle} type="button" className="flex items-center justify-center gap-3 bg-[#161B22] hover:bg-[#1A1F28] border border-[#232934] rounded-xl py-3.5 text-white/70 hover:text-white transition-all text-sm font-semibold shadow-inner">
              <svg viewBox="0 0 512 512" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456C103.821,274.792,107.225,292.797,113.47,309.408z" fill="#FBBB00"></path>
                <path d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z" fill="#518EF8"></path>
                <path d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" fill="#28B446"></path>
                <path d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0c53.115,0,101.568,19.862,138.904,52.336L419.404,58.936z" fill="#F14336"></path>
              </svg>
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-3 bg-[#161B22] hover:bg-[#1A1F28] border border-[#232934] rounded-xl py-3.5 text-white/70 hover:text-white transition-all text-sm font-semibold shadow-inner cursor-not-allowed">
              <svg viewBox="0 0 98 96" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-6.567-16.42-6.567-2.205-5.6-5.4-7.091-5.4-7.091-4.41-3.026.33-2.96.33-2.96 4.87.362 7.42 5.066 7.42 5.066 4.3 7.489 11.3 5.32 14.1 4.072.43-3.2 1.7-5.32 3.1-6.529-10.85-1.248-22.25-5.501-22.25-24.502 0-5.412 1.9-9.833 5.1-13.3-.5-1.28-2.2-6.304.5-13.131 0 0 4.1-1.34 13.4 5.034 3.9-1.096 8.1-1.644 12.2-1.666 4.1.022 8.3.57 12.2 1.666 9.3-6.374 13.4-5.034 13.4-5.034 2.7 6.827 1 11.851.5 13.131 3.2 3.467 5.1 7.888 5.1 13.3 0 19.053-11.4 23.221-22.3 24.436 1.8 1.579 3.3 4.595 3.3 9.255 0 6.696-.08 12.083-.08 13.725 0 1.32.88 2.872 3.34 2.382 19.382-6.536 33.374-24.937 33.374-46.721C97.707 22 75.86 0 48.854 0z" fill="#c9d1d9"></path>
              </svg>
              GitHub
            </button>
          </div>

          <p className="text-center text-[13px] text-white/40 mt-10">
            {isLogin ? "Don't have a character yet?" : "Already have a character?"}
            <button onClick={() => { setIsLogin(!isLogin); clearError() }} className="ml-2 text-blue-500 font-semibold hover:text-blue-400 transition-colors">
              {isLogin ? 'Create Account' : 'Login'}
            </button>
          </p>

        </div>
      </div>
    </div>
  )
}
