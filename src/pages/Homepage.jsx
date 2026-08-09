import { useEffect, useState, useRef } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../backend/config/firebase'
import PackageCard from '../components/PackageCard'
import { Search, Compass, Heart, Mountain } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function Homepage() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const heroRef = useRef(null)
  const contentRef = useRef(null)

  useGSAP(() => {
    // Hero entrance animation
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } })

    heroTimeline
      .from(".hero-bg", {
        scale: 1.1,
        opacity: 0,
        duration: 1.5,
        ease: "power2.out"
      })
      .from(".hero-badge", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        force3D: true
      }, "-=1")
      .from(".hero-title", {
        y: 80,
        opacity: 0,
        duration: 1.2,
        force3D: true
      }, "-=0.6")
      .from(".hero-subtitle", {
        y: 40,
        opacity: 0,
        duration: 1
      }, "-=0.8")
      .from(".hero-search", {
        y: 30,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: "back.out(1.7)"
      }, "-=0.6")

    // Package cards stagger animation
    if (!loading && packages.length > 0) {
      gsap.from(".package-card", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        force3D: true,
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      })
    }

    // Category sections animation
    gsap.from(".category-section", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: contentRef.current,
        start: "top 70%",
        toggleActions: "play none none reverse"
      }
    })

  }, { scope: heroRef, dependencies: [loading, packages] })

  useEffect(() => {
    async function loadPackages() {
      if (!db) {
         setLoading(false)
         return
      }
      try {
        const snap = await getDocs(collection(db, 'packages'))
        const pkgs = snap.docs.map(doc => ({ packageId: doc.id, ...doc.data() }))
        setPackages(pkgs)
      } catch (err) {
        console.error("Error loading packages", err)
      } finally {
        setLoading(false)
      }
    }
    loadPackages()
  }, [])

  // Group packages by category
  const categorized = packages.reduce((acc, pkg) => {
    const cat = pkg.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(pkg)
    return acc
  }, {})

  const CategorySection = ({ title, icon: Icon, items }) => {
    if (!items || items.length === 0) return null
    return (
      <div className="category-section mb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-line-200">
            <Icon className="w-6 h-6 text-monsoon-600" />
          </div>
          <h2 className="font-display font-bold text-3xl text-ink-900 tracking-tight">
            {title}
          </h2>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map(pkg => (
            <div key={pkg.packageId} className="package-card">
              <PackageCard pkg={pkg} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-body pb-20" ref={heroRef}>
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* High quality cover image */}
        <div 
          className="hero-bg absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=2000&q=80)' }}
        >
          {/* Dark gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/80 via-ink-900/40 to-paper-50"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-5xl px-6 text-center mt-[-10vh]">
          <span className="hero-badge inline-block py-1.5 px-4 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium tracking-wide uppercase will-change-transform">
            Start Your Journey
          </span>
          <h1 className="hero-title font-display font-bold text-6xl md:text-8xl text-white mb-6 drop-shadow-2xl tracking-tighter leading-tight will-change-transform">
            Discover the <br/><span className="text-marigold-500 italic pr-2 font-light">extraordinary.</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto font-light drop-shadow-md will-change-transform">
            Unforgettable curated travel experiences designed for the modern explorer.
          </p>

          {/* Smart Search Bar */}
          <div className="hero-search max-w-3xl mx-auto bg-white/95 backdrop-blur-xl p-2.5 rounded-full shadow-2xl flex items-center border border-white/40 will-change-transform">
            <div className="flex-1 flex items-center px-4 md:px-6">
              <Search className="w-6 h-6 text-monsoon-600 mr-3" />
              <input 
                type="text" 
                placeholder="Where to next? (e.g. Kyoto, Paris, Dubai)"
                className="w-full bg-transparent border-none focus:ring-0 text-lg py-3 text-ink-900 placeholder:text-slate-400 font-display outline-none"
              />
            </div>
            <button className="bg-marigold-500 hover:bg-marigold-600 text-white font-semibold px-8 py-4 rounded-full transition-all text-lg flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-marigold-500/30">
              Explore
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main ref={contentRef} className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-20">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-3xl aspect-[4/3] border border-line-200 shadow-sm"></div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-line-200 shadow-sm mt-10">
            <p className="text-slate-500 text-lg">No packages currently available.</p>
          </div>
        ) : (
          <div className="pt-10">
            <CategorySection title="Trending Now" icon={Compass} items={categorized['Trending']} />
            <CategorySection title="Romantic Getaways" icon={Heart} items={categorized['Romantic']} />
            <CategorySection title="Adventure Awaits" icon={Mountain} items={categorized['Adventure']} />
          </div>
        )}
      </main>
    </div>
  )
}
