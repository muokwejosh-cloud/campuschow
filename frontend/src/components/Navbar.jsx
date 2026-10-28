import React, { useState } from 'react';
import { ChevronDown, Moon, Ticket, User, LogOut } from 'lucide-react';

export default function Navbar({ onOpenAuth, user, onLogout, onOpenTokens }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="w-full bg-parchment sticky top-0 z-50 px-6 sm:px-12 py-4 border-b border-black/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-10">
          <a href="#" className="text-3xl font-extrabold tracking-tight text-brand lowercase">
            campuschow
          </a>

          <nav className="hidden md:flex items-center gap-7 text-[15px] font-medium text-charcoal/90">
            <a href="#" className="hover:text-brand transition-colors">Find food</a>
            <a href="#" className="hover:text-brand transition-colors">For kiosks</a>
            <a href="#" className="hover:text-brand transition-colors">Queue tokens</a>
            
            {/* More Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-brand transition-colors focus:outline-none">
                More
                <ChevronDown className="w-4 h-4 text-charcoal/60" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-black/5 p-2">
                  <a href="#" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-charcoal/80 hover:bg-stone-50 hover:text-brand">How Pickup Works</a>
                  <a href="#" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-charcoal/80 hover:bg-stone-50 hover:text-brand">Bukas & Cafeterias</a>
                  <a href="#" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-charcoal/80 hover:bg-stone-50 hover:text-brand">Help & Support</a>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-charcoal/70 hover:text-brand transition-colors" title="Toggle theme">
            <Moon className="w-5 h-5" />
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-charcoal bg-[#FAF7F2] border border-black/10 px-3 py-1.5 rounded-full">
                <User className="w-3.5 h-3.5 text-brand" />
                {user.name} ({user.role})
              </span>
              <button
                onClick={onLogout}
                className="p-2 text-stone-400 hover:text-red-500 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-[15px] font-medium text-charcoal/80 hover:text-brand px-2 transition"
            >
              Sign in
            </button>
          )}
          
          <button 
            onClick={onOpenTokens}
            className="bg-darkSurface text-white text-[14px] font-semibold px-5 py-2.5 rounded-full flex items-center gap-1.5 hover:bg-black transition"
          >
            <Ticket className="w-4 h-4" />
            <span>Queue Tokens</span>
          </button>
        </div>

      </div>
    </header>
  );
}