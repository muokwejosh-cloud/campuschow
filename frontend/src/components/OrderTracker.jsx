import React from 'react';
import { CheckCircle2, Clock, Utensils, RotateCw, X } from 'lucide-react';

export default function OrderTracker({ order, onClose }) {
  if (!order) return null;

  // Order status progression: Pending -> Preparing -> Ready -> Completed
  const statuses = ['Pending', 'Preparing', 'Ready', 'Completed'];
  const currentStep = statuses.indexOf(order.status);

  const getProgressPercentage = () => {
    switch (order.status) {
      case 'Pending':
        return '25%';
      case 'Preparing':
        return '60%';
      case 'Ready':
        return '100%';
      case 'Completed':
        return '100%';
      default:
        return '25%';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/5 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-charcoal hover:bg-stone-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-charcoal">Order confirmation & status</h2>
          <p className="text-xs font-semibold text-subtle mt-1">Real-time updates for pickup.</p>
        </div>

        {/* Generated Token Display (Fig. 3.7) */}
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-subtle block mb-1">
            Your pickup token:
          </span>
          <div className="border-2 border-charcoal rounded-2xl py-4 px-6 bg-[#FAF7F2] shadow-sm">
            <span className="text-3xl sm:text-4xl font-black text-charcoal tracking-wide">
              {order.tokenNo}
            </span>
          </div>
        </div>

        {/* Itemized Order Summary Box */}
        <div className="border border-black/10 rounded-2xl p-4 bg-stone-50/50 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3">Order summary:</h3>
          <div className="space-y-2 mb-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm font-semibold text-charcoal/90">
                <span>{item.quantity}x {item.name}</span>
                <span>₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {order.notes && (
            <p className="text-xs text-subtle italic bg-white p-2.5 rounded-xl border border-black/5 mb-3">
              Note: "{order.notes}"
            </p>
          )}

          <div className="border-t border-dashed border-black/15 pt-3 flex justify-between items-center text-base font-black text-charcoal">
            <span>Total</span>
            <span className="text-brand">₦{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Dynamic Queue Status Capsule */}
        <div className="text-center mb-3">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-black/15 text-xs font-black tracking-wide uppercase bg-white shadow-sm">
            {order.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
            {order.status === 'Preparing' && <Utensils className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
            {order.status === 'Ready' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            Status: {order.status === 'Ready' ? 'READY FOR PICKUP' : `${order.status.toUpperCase()}...`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-200 h-3 rounded-full overflow-hidden p-0.5 mb-8">
          <div
            className="bg-charcoal h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: getProgressPercentage() }}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              // Simulated status progression for preview
              const nextStatus = {
                'Pending': 'Preparing',
                'Preparing': 'Ready',
                'Ready': 'Pending'
              };
              order.onStatusUpdate(nextStatus[order.status]);
            }}
            className="w-full py-3 px-5 border-2 border-charcoal hover:bg-stone-100 rounded-full font-bold text-sm text-charcoal flex items-center justify-center gap-2 transition"
          >
            <RotateCw className="w-4 h-4" />
            <span>Simulate Status Advance ({order.status})</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 px-5 border-2 border-charcoal bg-charcoal text-white hover:bg-black rounded-full font-bold text-sm transition"
          >
            Return to home
          </button>
        </div>

      </div>
    </div>
  );
}