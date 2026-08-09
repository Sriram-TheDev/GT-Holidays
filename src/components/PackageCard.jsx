import { Link } from 'react-router-dom'
import { Clock, MapPin, Star } from 'lucide-react'

export default function PackageCard({ pkg }) {
  // Format currency
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-line-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1 will-change-transform">
      {/* 🖼️ Image Wrapper */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={pkg.images?.[0] || 'https://via.placeholder.com/600'}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Rating Badge */}
        {pkg.rating && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-sm font-medium text-ink-900 shadow-sm">
            <Star className="w-4 h-4 text-marigold-500 fill-marigold-500" />
            {pkg.rating} <span className="text-slate-500 text-xs">({pkg.reviewCount})</span>
          </div>
        )}
      </div>

      {/* 📝 Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-monsoon-600 text-sm font-medium mb-2">
          <MapPin className="w-4 h-4" />
          <span>{pkg.country}</span>
          <span className="text-line-200">|</span>
          <Clock className="w-4 h-4 ml-1" />
          <span>
            {pkg.durationDays}D / {pkg.durationNights}N
          </span>
        </div>

        <h3 className="font-display text-xl font-bold text-ink-900 mb-2 leading-tight">
          {pkg.title}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4 font-body">
          {pkg.description}
        </p>

        <div className="mt-auto pt-4 border-t border-line-200/60 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 mb-0.5">Starts from</div>
            <div className="font-display font-semibold text-lg text-ink-900">
              {formatPrice(pkg.basePriceAdult)}
            </div>
          </div>
          <Link
            to={`/package/${pkg.packageId}`}
            className="bg-marigold-500 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-marigold-600 hover:shadow-lg hover:shadow-marigold-500/30 transition-all duration-300 text-sm hover:-translate-y-0.5 will-change-transform"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
