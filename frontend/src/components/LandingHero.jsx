import React from 'react';
import { Clock, Ticket, UtensilsCrossed, ArrowDown, Zap } from 'lucide-react';

export default function LandingHero({ onExploreMenu, onOpenAuth, user }) {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 px-6 sm:px-12 bg-parchment border-b border-black/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Top Content */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-1.5 rounded-full text-brand text-xs font-bold uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Built for 15-Minute Lecture Break Pickup</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-charcoal tracking-tight leading-[1.1] mb-6">
            Skip the cafeteria line. <br />
            <span className="text-brand">Pick up with a digital token.</span>
          </h1>

          <p className="text-subtle text-base sm:text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            CampusChow lets you pre-order meals from campus kiosks, syncs your tray live with kitchen terminals, and issues a pickup token so your plate is waiting the minute lecture ends.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onExploreMenu}
              className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-white text-sm sm:text-base font-bold px-8 py-3.5 rounded-full shadow-lg shadow-brand/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <span>Explore Kiosk Menus</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            {/* Only show Sign In / Register if the user is NOT logged in */}
            {!user && (
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto bg-white hover:bg-stone-50 text-charcoal border border-black/10 text-sm sm:text-base font-bold px-8 py-3.5 rounded-full transition"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>

        {/* 3-Step Pickup Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 pt-10 border-t border-black/5">
          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm text-left hover:border-brand/30 transition">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-charcoal mb-2">1. Tray & Custom Notes</h3>
            <p className="text-subtle text-xs leading-relaxed">
              Select dishes from bukkas and cafeterias, add preparation preferences (e.g. extra pepper), and pre-order from your seat.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm text-left hover:border-brand/30 transition">
            <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand mb-4">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-charcoal mb-2">2. Live Queue Sync</h3>
            <p className="text-subtle text-xs leading-relaxed">
              A unique digital token is generated and pushed instantly to the vendor’s kitchen terminal via WebSockets.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm text-left hover:border-brand/30 transition">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-charcoal mb-2">3. Zero-Delay Counter Collection</h3>
            <p className="text-subtle text-xs leading-relaxed">
              When the kiosk marks your meal "Ready", flash your token at the pickup counter and grab your meal with zero line delays.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}