import { Receipt, Tag } from 'lucide-react'

export default function PriceSummary({ priceBreakdown, onBookClick, disabled }) {
  if (!priceBreakdown) return null

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)

  const { adultCharge, childCharge, infantCharge, subtotal, discount, total } = priceBreakdown

  return (
    <div className="bg-white rounded-xl border border-line-200 overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-line-200 p-4 flex items-center gap-2">
        <Receipt className="w-5 h-5 text-monsoon-600" />
        <h4 className="font-display font-semibold text-ink-900">Price Breakdown</h4>
      </div>
      
      <div className="p-4 bg-white font-mono text-sm text-slate-600 space-y-2">
        {adultCharge > 0 && (
          <div className="flex justify-between">
            <span>Adults (x)</span>
            <span className="text-ink-900">{formatPrice(adultCharge)}</span>
          </div>
        )}
        {childCharge > 0 && (
          <div className="flex justify-between">
            <span>Children (x)</span>
            <span className="text-ink-900">{formatPrice(childCharge)}</span>
          </div>
        )}
        {infantCharge > 0 && (
          <div className="flex justify-between">
            <span>Infants (x)</span>
            <span className="text-ink-900">{formatPrice(infantCharge)}</span>
          </div>
        )}
        
        <div className="border-t border-dashed border-line-200 pt-2 mt-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-ink-900">{formatPrice(subtotal)}</span>
          </div>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600 font-medium pt-1">
            <span className="flex items-center gap-1"><Tag className="w-3 h-3"/> Promo Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
      </div>

      {/* Total & Action */}
      <div className="p-5 bg-paper-50 border-t border-line-200">
        <div className="flex justify-between items-center mb-4">
          <span className="font-display font-medium text-slate-500">Total</span>
          <span className="font-display font-bold text-2xl text-ink-900">{formatPrice(total)}</span>
        </div>
        
        <button
          onClick={onBookClick}
          disabled={disabled}
          className="w-full bg-marigold-500 text-white font-body font-semibold text-lg py-3 rounded-lg hover:bg-marigold-500/90 hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Book Now
        </button>
      </div>
    </div>
  )
}
