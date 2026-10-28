import React from 'react';
import { X, Ticket, Clock, CheckCircle2, Flame, CheckCheck } from 'lucide-react';

export default function ActiveTokensDrawer({ isOpen, onClose, activeOrder, onCompleteOrder }) {
  if (!isOpen) return null;

  // Retrieve active order from state or localStorage
  const currentOrder =
    activeOrder ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem('campuschow_active_order'));
      } catch (e) {
        return null;
      }
    })();

  // Retrieve past completed orders list
  const completedOrders = (() => {
    try {
      return JSON.parse(localStorage.getItem('campuschow_completed_orders')) || [];
    } catch (e) {
      return [];
    }
  })();

  const status = currentOrder?.status || 'Pending';
  const isPending = status === 'Pending';
  const isAlmostReady = status === 'Almost Ready';
  const isReady = status === 'Ready';

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
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-charcoal">My Tokens</h2>
                <p className="text-xs text-subtle">Live pickup queue & order history</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-charcoal hover:bg-stone-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Active Order Card */}
            {currentOrder ? (
              <div className="bg-[#FAF7F2] border border-black/10 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand">
                    Active Order
                  </span>
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      isReady
                        ? 'bg-emerald-100 text-emerald-800'
                        : isAlmostReady
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-black/5 text-center mb-4">
                  <span className="text-xs text-subtle block uppercase font-bold tracking-widest">
                    Counter Pickup Token
                  </span>
                  <span className="text-3xl font-black text-charcoal tracking-tight">
                    {currentOrder.tokenNo}
                  </span>
                </div>

                <div className="space-y-2 border-t border-black/5 pt-3">
                  <span className="text-xs font-bold text-charcoal block">Items:</span>
                  {currentOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-subtle">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-semibold text-charcoal">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-black/5 pt-3 mt-3">
                  <span className="text-xs font-bold text-charcoal">Total Amount</span>
                  <span className="text-base font-black text-brand">
                    ₦{currentOrder.totalAmount?.toLocaleString()}
                  </span>
                </div>

                {/* Status Guidance */}
                {isReady ? (
                  <div className="mt-4 space-y-2">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Meal is ready! Proceed to the counter for pickup.</span>
                    </div>

                    <button
                      onClick={() => onCompleteOrder(currentOrder)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-emerald-600/20"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>I have picked up my meal (Mark Completed)</span>
                    </button>
                  </div>
                ) : isAlmostReady ? (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs text-amber-900 font-bold">
                    <Flame className="w-4 h-4 shrink-0 text-amber-600 animate-pulse" />
                    <span>Plate is almost ready! Start heading to the counter.</span>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-stone-100 border border-stone-200 rounded-2xl flex items-center gap-2 text-xs text-stone-600 font-medium">
                    <Clock className="w-4 h-4 shrink-0 animate-spin" />
                    <span>Kitchen has received your order and is preparing it...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-subtle bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                <Ticket className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                <p className="text-xs font-bold text-charcoal">No active tokens in queue</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Orders in progress will appear here.</p>
              </div>
            )}

            {/* Past Completed Orders Section */}
            {completedOrders.length > 0 && (
              <div className="border-t border-black/5 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                  Completed Orders ({completedOrders.length})
                </h3>

                <div className="space-y-3">
                  {completedOrders.map((order, idx) => (
                    <div
                      key={order._id || idx}
                      className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-stone-900">{order.tokenNo}</span>
                          <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                          {order.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                      </div>

                      <span className="text-xs font-bold text-stone-900">
                        ₦{order.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}