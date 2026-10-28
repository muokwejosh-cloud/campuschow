import React from 'react';
import { ArrowUpRight, Store, ChefHat, Sparkles } from 'lucide-react';

export default function VendorBanner({ onOpenVendorView }) {
  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-12 my-14">
      <div className="bg-brand rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* Left Copy & Actions */}
        <div className="max-w-xl z-10">
          <div className="inline-flex items-center gap-2 bg-black/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Campus Kiosk & Buka Partnership</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-6">
            Your menu <br className="hidden sm:block" />on CampusChow.
          </h2>

          <p className="text-white/90 text-base sm:text-lg font-medium max-w-md leading-relaxed mb-8">
            Campus cafeterias, bukas, and snack joints list daily combos. Students pre-order and pick up with instant queue tokens.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenVendorView}
              className="bg-black hover:bg-neutral-900 text-white font-bold py-3.5 px-7 rounded-full flex items-center gap-2 text-sm shadow-lg transition-transform active:scale-95"
            >
              <span>Launch Vendor Dashboard</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-white/75 font-semibold">
              Zero hardware setup • Real-time queue sync
            </span>
          </div>
        </div>

        {/* Right Graphic / Interactive Showcase */}
        <div className="w-full lg:w-auto z-10 flex justify-center">
          <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 shadow-inner flex flex-col items-center max-w-sm text-center">
            <div className="w-20 h-20 rounded-2xl bg-white text-brand flex items-center justify-center shadow-md mb-4">
              <ChefHat className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-white">Live Kitchen Terminal</h3>
            <p className="text-xs text-white/80 mt-2 leading-relaxed">
              Accept orders during acute 20-minute lecture breaks and flag meals ready with one tap.
            </p>
            <div className="mt-5 w-full bg-black/20 p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs font-bold">
              <span>Current Status:</span>
              <span className="text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Receiving Orders
              </span>
            </div>
          </div>
        </div>

        {/* Subtle Decorative Background Rings */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>
    </section>
  );
}