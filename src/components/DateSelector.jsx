import { Calendar } from 'lucide-react'

export default function DateSelector({ availableDates, selectedDate, onSelect }) {
  const parseStatus = (status) => {
    switch (status) {
      case 'available': return { color: 'bg-green-100 text-green-700 border-green-200', label: 'Available' }
      case 'limited':   return { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Filling fast' }
      case 'sold_out':  return { color: 'bg-slate-100 text-slate-500 border-slate-200', label: 'Sold Out' }
      default:          return { color: 'bg-paper-50 text-ink-900 border-line-200', label: 'Unknown' }
    }
  }

  // Formatting date string like "2026-09-10" to "Sep 10"
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-monsoon-600" />
        <h4 className="font-display font-semibold text-ink-900">Select Date</h4>
      </div>
      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
        {availableDates?.map((d) => {
          const isSelected = selectedDate === d.date
          const stat = parseStatus(d.status)
          const isSoldOut = d.status === 'sold_out'

          return (
            <button
              key={d.date}
              disabled={isSoldOut}
              onClick={() => onSelect(d.date)}
              className={`
                min-w-[110px] p-3 rounded-xl border text-center transition-all flex-shrink-0 cursor-pointer
                ${isSoldOut ? 'opacity-50 cursor-not-allowed' : 'hover:border-marigold-500'}
                ${isSelected ? 'border-marigold-500 bg-orange-50 ring-1 ring-marigold-500' : 'bg-white border-line-200'}
              `}
            >
              <div className={`font-semibold text-lg ${isSelected ? 'text-marigold-600' : 'text-ink-900'}`}>
                {formatDate(d.date)}
              </div>
              <div className={`mt-1 text-xs px-2 py-0.5 rounded-full inline-block border ${stat.color}`}>
                {stat.label}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
