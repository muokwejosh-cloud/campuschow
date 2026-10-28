import React from 'react';
import { Plus } from 'lucide-react';

export default function FoodCard({ item, onAddToCart }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      {/* Food Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Vendor Tag */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {item.vendor}
        </span>
      </div>

      {/* Card Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg text-charcoal leading-snug group-hover:text-brand transition-colors">
              {item.name}
            </h3>
            <span className="font-extrabold text-brand text-base whitespace-nowrap">
              ₦{item.price.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-subtle mt-1.5 line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Add to Tray Action */}
        <button
          onClick={() => onAddToCart(item)}
          className="mt-4 w-full bg-[#F3EFE6] hover:bg-brand hover:text-white text-charcoal font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Tray</span>
        </button>
      </div>
    </div>
  );
}