import { useState } from 'react'
import { ChevronDown, MapPin, Utensils, Bed, Bus } from 'lucide-react'

export default function ItineraryDay({ day, isActive, onClick }) {
  return (
    <div className={`border border-line-200 rounded-xl mb-4 transition-all duration-300 overflow-hidden bg-white ${isActive ? 'ring-2 ring-monsoon-600/20 shadow-md' : 'shadow-sm'}`}>
      
      {/* Header (Clickable) */}
      <button 
        onClick={onClick}
        className="w-full flex items-center p-4 text-left cursor-pointer hover:bg-paper-50 transition-colors"
      >
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-lg mr-4 flex-shrink-0 transition-colors
          ${isActive ? 'bg-monsoon-600 text-white' : 'bg-paper-50 text-slate-500 border border-line-200'}`}
        >
          D{day.dayNumber}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-lg text-ink-900 leading-tight truncate">
            {day.title}
          </h3>
          <div className="text-monsoon-600 text-sm font-medium flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {day.city}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Content */}
      <div className={`px-4 pb-4 px-16 transition-all duration-300 ${isActive ? 'block' : 'hidden'}`}>
        <div className="pt-2 border-t border-line-200 space-y-4">
          
          {/* Activities List */}
          {day.activities && day.activities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Activities</h4>
              <ul className="list-disc list-inside text-sm text-ink-900 space-y-1 ml-1 font-body">
                {day.activities.map((act, i) => <li key={i}>{act}</li>)}
              </ul>
            </div>
          )}

          {/* Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {day.hotel && (
              <div className="flex items-start gap-2 bg-paper-50 p-2.5 rounded-lg border border-line-200/50">
                <Bed className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accommodation</div>
                  <div className="text-sm text-ink-900">{day.hotel}</div>
                </div>
              </div>
            )}
            
            {day.meals && (
              <div className="flex items-start gap-2 bg-paper-50 p-2.5 rounded-lg border border-line-200/50">
                <Utensils className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meals Included</div>
                  <div className="text-sm text-ink-900">{day.meals}</div>
                </div>
              </div>
            )}

            {day.transport && (
              <div className="flex items-start gap-2 bg-paper-50 p-2.5 rounded-lg border border-line-200/50 sm:col-span-2">
                <Bus className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transport</div>
                  <div className="text-sm text-ink-900">{day.transport}</div>
                </div>
              </div>
            )}
          </div>
          
          {day.notes && (
            <div className="text-xs text-slate-500 italic mt-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              Note: {day.notes}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
