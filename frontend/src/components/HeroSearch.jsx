import React, { useState } from 'react';
import { Search, ChevronDown, LayoutGrid, Utensils, Soup, ShoppingBag } from 'lucide-react';

export default function HeroSearch({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'restaurants', label: 'Restaurants', icon: Utensils },
    { id: 'bukas', label: 'Bukas', icon: Soup },
    { id: 'groceries', label: 'Groceries', icon: ShoppingBag },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-12 pb-6">
      {/* Big Headline */}
      <h1 className="text-4xl sm:text-6xl font-black text-charcoal tracking-tight max-w-2xl leading-none">
        Order food and groceries
      </h1>

      {/* Dual Floating Search Input Bar */}
      <div className="mt-8 flex flex-col sm:flex-row items-center bg-[#F3EFE6] rounded-full p-2 max-w-4xl shadow-inner border border-black/5">
        
        {/* Search Field */}
        <div className="flex items-center gap-3 flex-1 px-4 py-2 w-full">
          <Search className="w-5 h-5 text-charcoal/40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Jollof, rice, a campus kiosk name"
            className="w-full bg-transparent text-charcoal placeholder:text-charcoal/40 text-[15px] focus:outline-none"
          />
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block w-[1px] h-6 bg-black/10 mx-2"></div>

        {/* Location Dropdown Field */}
        <div className="flex items-center justify-between gap-4 px-4 py-2 cursor-pointer w-full sm:w-auto text-[15px] text-charcoal/70 hover:text-charcoal">
          <span>All campus locations</span>
          <ChevronDown className="w-4 h-4 text-charcoal/40" />
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-8 mt-8 border-b border-black/5 pb-3 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-2 text-[15px] font-semibold transition-all relative ${
                isActive ? 'text-charcoal' : 'text-charcoal/45 hover:text-charcoal/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-[-13px] left-0 right-0 h-[2.5px] bg-brand rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}