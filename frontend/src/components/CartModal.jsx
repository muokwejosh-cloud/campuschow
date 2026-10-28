import React, { useState } from 'react';
import { X, Trash2, ArrowRight, Utensils } from 'lucide-react';

export default function CartModal({
  isOpen,
  onClose,
  cartItems = [],
  onRemoveItem,
  onProceedToOrder,
}) {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const total = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    onProceedToOrder(notes, total);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-black/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-charcoal">Your Tray</h2>
              <p className="text-xs text-subtle">Review your order before queue token generation</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-charcoal hover:bg-stone-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 text-subtle">
                <Utensils className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                <p className="text-sm font-bold text-charcoal">Your tray is empty</p>
                <p className="text-xs mt-1">Select meals from the combos or kiosks list.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60"
                >
                  <div className="flex-1 pr-3">
                    <h4 className="text-sm font-bold text-stone-900 leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs text-brand font-semibold mt-0.5">
                      ₦{item.price?.toLocaleString()} × {item.quantity}
                    </p>
                    <p className="text-[11px] text-stone-400">{item.vendor}</p>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-white transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}

            {cartItems.length > 0 && (
              <div className="pt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Dietary Preferences / Notes (Max 200 chars)
                </label>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Extra pepper, no onions, or collect at 1:30 PM..."
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand bg-stone-50"
                />
                <span className="text-[10px] text-stone-400 block text-right mt-1">
                  {notes.length}/200
                </span>
              </div>
            )}
          </div>

          {/* Footer Checkout Button */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-black/5 bg-stone-50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-stone-500">Total Amount</span>
                <span className="text-2xl font-black text-stone-900">
                  ₦{total.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-brand/20 transition active:scale-95"
              >
                <span>Generate Pickup Token</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}