import { Users, Plus, Minus } from 'lucide-react'

export default function TravelerSelector({ adults, children, infants, onChange }) {
  
  const Stepper = ({ label, desc, value, min = 0, field }) => {
    const isMin = value <= min

    return (
      <div className="flex items-center justify-between py-3 border-b border-line-200/50 last:border-0">
        <div>
          <div className="font-medium text-ink-900 text-sm">{label}</div>
          <div className="text-xs text-slate-500">{desc}</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChange(field, value - 1)}
            disabled={isMin}
            className={`w-8 h-8 rounded-full border border-line-200 flex items-center justify-center transition-colors cursor-pointer
              ${isMin ? 'bg-paper-50 text-slate-400 cursor-not-allowed' : 'bg-white text-ink-900 hover:border-monsoon-600 hover:text-monsoon-600'}`}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-4 text-center font-semibold font-mono text-ink-900">{value}</span>
          <button
            onClick={() => onChange(field, value + 1)}
            className="w-8 h-8 rounded-full border border-line-200 bg-white text-ink-900 flex items-center justify-center hover:border-monsoon-600 hover:text-monsoon-600 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 bg-paper-50/50 rounded-xl border border-line-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-5 h-5 text-monsoon-600" />
        <h4 className="font-display font-semibold text-ink-900">Travelers</h4>
      </div>
      <div>
        <Stepper label="Adults" desc="Ages 12 or above" value={adults} min={1} field="adults" />
        <Stepper label="Children" desc="Ages 2–11" value={children} min={0} field="children" />
        <Stepper label="Infants" desc="Under 2" value={infants} min={0} field="infants" />
      </div>
    </div>
  )
}
