import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

const VENDOR_MENUS = {
  'Jroyals': [
    { id: 'jr1', name: 'Jollof Rice & Fried Chicken', price: 2000 },
    { id: 'jr2', name: 'Fried Rice Plate', price: 1800 },
    { id: 'jr3', name: 'Grilled Chicken (Portion)', price: 1500 },
    { id: 'jr4', name: 'Fried Plantain (Dodo)', price: 500 },
    { id: 'jr5', name: 'Bottled Water', price: 300 },
    { id: 'jr6', name: 'Chilled Soda (Can)', price: 400 },
  ],
  'Chitis': [
    { id: 'ch1', name: 'Ewa Aganyin & Bread', price: 1500 },
    { id: 'ch2', name: 'Agege Bread & Fried Egg Combo', price: 1200 },
    { id: 'ch3', name: 'Special Spaghetti Stir Fry', price: 1800 },
    { id: 'ch4', name: 'Crispy Sausage Roll', price: 600 },
    { id: 'ch5', name: 'Meat Pie', price: 700 },
    { id: 'ch6', name: 'Chilled Fruit Juice', price: 600 },
  ],
  'Nuel Restaurants': [
    { id: 'nr1', name: 'White Rice, Beans & Plantain', price: 1600 },
    { id: 'nr2', name: 'Smoky Jollof Rice & Peppered Beef', price: 2200 },
    { id: 'nr3', name: 'Fried Beef (Chunk)', price: 1000 },
    { id: 'nr4', name: 'Steamed Fish Sauce', price: 1200 },
    { id: 'nr5', name: 'Coleslaw Salad', price: 400 },
    { id: 'nr6', name: 'Chilled Soft Drink', price: 400 },
  ],
  'Local Delicacy': [
    { id: 'ld1', name: 'Pounded Yam & Egusi Soup', price: 2500 },
    { id: 'ld2', name: 'Semovita with Ogbono Soup', price: 2200 },
    { id: 'ld3', name: 'Abacha & Ugba Special', price: 1800 },
    { id: 'ld4', name: 'Assorted Goat Meat', price: 1500 },
    { id: 'ld5', name: 'Smoked Stockfish Portion', price: 1200 },
    { id: 'ld6', name: 'Palm Wine (Fresh Bottle)', price: 800 },
  ],
};

export default function PlaceOrderModal({ isOpen, onClose, onGenerateToken, defaultVendor }) {
  const [selectedVendor, setSelectedVendor] = useState('Jroyals');
  const [selectedItems, setSelectedItems] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (defaultVendor && VENDOR_MENUS[defaultVendor]) {
      setSelectedVendor(defaultVendor);
    }
  }, [defaultVendor]);

  const handleVendorChange = (e) => {
    setSelectedVendor(e.target.value);
    setSelectedItems([]);
  };

  const handleToggleItem = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  if (!isOpen) return null;

  const currentMenuItems = VENDOR_MENUS[selectedVendor] || [];
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Please select at least one menu item.');
      return;
    }

    onGenerateToken({
      vendor: selectedVendor,
      items: selectedItems.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: 1,
      })),
      totalAmount,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Clickable Backdrop to close */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] z-10 overflow-hidden my-auto">
        
        {/* Sticky Header with Title and Visible Close Button */}
        <div className="sticky top-0 bg-white px-6 sm:px-8 py-5 border-b border-stone-100 flex items-center justify-between z-20">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Place Your Meal Order
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
              Select items and add special instructions.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition shadow-sm"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
          
          {/* Select Vendor Store Dropdown */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Select Vendor Store:
            </label>
            <div className="relative">
              <select
                value={selectedVendor}
                onChange={handleVendorChange}
                className="w-full appearance-none bg-white border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:border-brand font-medium shadow-sm"
              >
                {Object.keys(VENDOR_MENUS).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Select Menu Items Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Select Menu Items:
            </label>
            <div className="border border-stone-200 rounded-2xl p-3 divide-y divide-stone-100 bg-[#FAF9F5] max-h-52 overflow-y-auto">
              {currentMenuItems.map((item) => {
                const isChecked = selectedItems.some((i) => i.id === item.id);
                return (
                  <label
                    key={item.id}
                    className="flex items-center justify-between py-2.5 px-2 hover:bg-stone-100 rounded-lg cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleItem(item)}
                        className="w-4 h-4 text-brand rounded border-stone-300 focus:ring-brand accent-brand cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-stone-800">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-stone-900">
                      ₦{item.price.toLocaleString()}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Special Instructions / Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Special Instructions / Notes:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter dietary preferences or pickup notes..."
              className="w-full p-3.5 rounded-xl border border-stone-300 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand bg-white shadow-sm"
            />
          </div>

          {/* Footer Total & Submit Button */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 font-bold block">TOTAL DUE</span>
              <span className="text-2xl font-black text-stone-900">
                ₦{totalAmount.toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              className="bg-brand hover:bg-brand-hover text-white font-bold py-3.5 px-6 rounded-xl text-sm flex items-center gap-2 transition active:scale-95 shadow-md shadow-brand/20"
            >
              <span>Generate Pickup Token</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}