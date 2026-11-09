import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import VendorDashboardView from './components/VendorDashboardView';
import ActiveTokensDrawer from './components/ActiveTokensDrawer';
import CartModal from './components/CartModal';
import OrderTracker from './components/OrderTracker';
import PlaceOrderModal from './components/PlaceOrderModal';
import { Search, ChevronDown, Plus, ShoppingBag, Utensils, ArrowUpRight } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const COMBOS_DATA = [
  {
    id: 1,
    name: 'Jollof Rice & Fried Chicken Combo',
    vendor: 'Jroyals',
    price: 2500,
    rating: '4.2',
    image: '/jollof-chicken.jpg',
    category: 'restaurants'
  },
  {
    id: 2,
    name: 'Agege Bread & Fried Egg Combo',
    vendor: 'Chitis',
    price: 1700,
    rating: '3.6',
    image: '/agege-bread.jpg.webp',
    category: 'bukas'
  },
  {
    id: 3,
    name: 'White Rice, Beans & Peppered Beef',
    vendor: 'Nuel Restaurants',
    price: 2500,
    rating: '4.5',
    image: '/rice-beans.jpg',
    category: 'restaurants'
  },
  {
    id: 4,
    name: 'Pounded Yam & Egusi Delicacy',
    vendor: 'Local Delicacy',
    price: 2500,
    rating: '4.8',
    image: '/egusi.jpg',
    category: 'bukas'
  },
  {
    id: 5,
    name: 'Ewa agonyi and dodo ',
    vendor: 'Nuel Restaurants',
    price: 1800,
    rating: '4.1',
    image: '/ewa-aganyin.jpg',
    category: 'bukas'
  }
];

const STORES_DATA = [
  {
    id: 's1',
    name: 'Jroyals',
    category: 'Restaurant',
    location: 'UNN Campus',
    rating: '4.2',
    avatar: '🍜',
    bgColor: 'bg-white text-brand'
  },
  {
    id: 's2',
    name: 'Chitis',
    category: 'Restaurant',
    location: 'Inside Campus',
    rating: '3.6',
    avatar: '🍲',
    bgColor: 'bg-purple-900 text-white'
  },
  {
    id: 's3',
    name: 'Nuel Restaurants',
    category: 'Restaurant',
    location: 'UNN Campus',
    rating: '4.5',
    avatar: '👨‍🍳',
    bgColor: 'bg-white text-stone-900 border'
  },
  {
    id: 's4',
    name: 'Local Delicacy',
    category: 'Buka / Restaurant',
    location: 'Hilltop',
    rating: '4.8',
    avatar: '🍲',
    bgColor: 'bg-stone-100 text-stone-800 border'
  }
];

export default function App() {
  const [pendingAction, setPendingAction] = useState(null); // 'tray_checkout' or 'quick_order'
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All areas');
  
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTokensDrawerOpen, setIsTokensDrawerOpen] = useState(false);
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = useState(false);
  const [activeVendorSelection, setActiveVendorSelection] = useState('Jroyals');
  const [currentUser, setCurrentUser] = useState(null);

  // Restore authenticated session and active token on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('campuschow_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('campuschow_user');
      }
    }

    const savedOrder = localStorage.getItem('campuschow_active_order');
    if (savedOrder) {
      try {
        setActiveOrder(JSON.parse(savedOrder));
      } catch (e) {
        localStorage.removeItem('campuschow_active_order');
      }
    }
  }, []);

  // Listen for real-time order status changes
  useEffect(() => {
    socket.on('orderStatusUpdated', (updatedOrder) => {
      setActiveOrder((prev) => {
        if (prev && prev._id === updatedOrder._id) {
          // If vendor marked it as Completed, move it straight to completed history
          if (updatedOrder.status === 'Completed') {
            const existingHistory = (() => {
              try {
                return JSON.parse(localStorage.getItem('campuschow_completed_orders')) || [];
              } catch (e) {
                return [];
              }
            })();

            const updatedHistory = [{ ...prev, status: 'Completed' }, ...existingHistory.filter(o => o._id !== updatedOrder._id)];
            localStorage.setItem('campuschow_completed_orders', JSON.stringify(updatedHistory));
            localStorage.removeItem('campuschow_active_order');
            return null;
          }

          const fresh = { ...prev, status: updatedOrder.status };
          localStorage.setItem('campuschow_active_order', JSON.stringify(fresh));
          return fresh;
        }
        return prev;
      });
    });

    return () => {
      socket.off('orderStatusUpdated');
    };
  }, []);

  // Guard: Vendors cannot add meals to tray
  const handleAddToCart = (item) => {
    if (currentUser?.role === 'vendor') {
      alert('Vendor accounts cannot place orders. Please sign in as a student to order food.');
      return;
    }
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  // Guard: Vendors cannot open custom meal ordering
  const handleOpenPlaceOrder = (vendorName) => {
    if (currentUser?.role === 'vendor') {
      alert('Vendor accounts cannot place orders. Please sign in as a student to order food.');
      return;
    }
    setActiveVendorSelection(vendorName || 'Jroyals');
    setIsPlaceOrderOpen(true);
  };

  // Student completes/picks up meal from drawer
  const handleCompleteOrder = async (orderToComplete) => {
    try {
      await fetch(`http://localhost:5000/api/orders/${orderToComplete._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' }),
      });

      const existingHistory = (() => {
        try {
          return JSON.parse(localStorage.getItem('campuschow_completed_orders')) || [];
        } catch (e) {
          return [];
        }
      })();

      const updatedHistory = [{ ...orderToComplete, status: 'Completed' }, ...existingHistory.filter(o => o._id !== orderToComplete._id)];
      localStorage.setItem('campuschow_completed_orders', JSON.stringify(updatedHistory));

      setActiveOrder(null);
      localStorage.removeItem('campuschow_active_order');
    } catch (err) {
      console.error('Error completing order:', err);
    }
  };

  // Guard: Must be signed in as a student to checkout tray
  const handleProceedToOrder = async (notes, total) => {
    if (!currentUser) {
      setPendingAction('tray_checkout');
      setPendingOrderData({ notes, total });
      setIsCartOpen(false);
      setIsAuthOpen(true);
      return;
    }
    if (currentUser.role === 'vendor') {
      alert('Vendor accounts cannot place orders.');
      return;
    }
    await executeTrayCheckout(notes, total, currentUser);
  };

  const executeTrayCheckout = async (notes, total, user) => {
    const letters = ['A', 'B', 'C', 'K'];
    const prefix = letters[Math.floor(Math.random() * letters.length)];
    const tokenNo = `TOKEN #${prefix}-${Math.floor(100 + Math.random() * 900)}`;

    const orderPayload = {
      tokenNo,
      items: cartItems.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: total,
      notes: notes,
      customerPhone: user?.phone || 'Guest Student',
      status: 'Pending'
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const savedOrder = await res.json();
      setActiveOrder(savedOrder);
      localStorage.setItem('campuschow_active_order', JSON.stringify(savedOrder));

      setCartItems([]);
      setIsCartOpen(false);
      setIsTokensDrawerOpen(true);
    } catch (err) {
      console.error(err);
      alert('Could not submit order to server.');
    }
  };

  // Guard: Must be signed in as a student to place meal order
  const handleQuickPlaceOrder = async (orderData) => {
    if (!currentUser) {
      setPendingAction('quick_order');
      setPendingOrderData(orderData);
      setIsPlaceOrderOpen(false);
      setIsAuthOpen(true);
      return;
    }
    if (currentUser.role === 'vendor') {
      alert('Vendor accounts cannot place orders.');
      return;
    }
    await executeQuickOrder(orderData, currentUser);
  };

  const executeQuickOrder = async (orderData, user) => {
    const letters = ['A', 'B', 'C', 'K'];
    const prefix = letters[Math.floor(Math.random() * letters.length)];
    const tokenNo = `TOKEN #${prefix}-${Math.floor(100 + Math.random() * 900)}`;

    const orderPayload = {
      tokenNo,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      notes: orderData.notes,
      vendor: orderData.vendor,
      customerPhone: user?.phone || 'Guest Student',
      status: 'Pending',
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const savedOrder = await res.json();
      setActiveOrder(savedOrder);
      localStorage.setItem('campuschow_active_order', JSON.stringify(savedOrder));

      setIsPlaceOrderOpen(false);
      setIsTokensDrawerOpen(true);
    } catch (err) {
      console.error(err);
      alert('Could not submit order to server.');
    }
  };

  const scrollToExplore = () => {
    const target = document.getElementById('browse-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredCombos = COMBOS_DATA.filter((combo) => {
    const matchesSearch =
      combo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      combo.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'all' || combo.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // VENDOR SEPARATE LAYOUT
  if (currentUser?.role === 'vendor') {
    return (
      <VendorDashboardView
        user={currentUser}
        onLogout={() => {
          localStorage.removeItem('campuschow_token');
          localStorage.removeItem('campuschow_user');
          localStorage.removeItem('campuschow_active_order');
          setCurrentUser(null);
          setActiveOrder(null);
        }}
      />
    );
  }

  // STUDENT / GUEST VISITOR LAYOUT
  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-24 text-stone-800">
      
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        user={currentUser}
        onLogout={() => {
          localStorage.removeItem('campuschow_token');
          localStorage.removeItem('campuschow_user');
          localStorage.removeItem('campuschow_active_order');
          setCurrentUser(null);
          setActiveOrder(null);
        }}
        onOpenTokens={() => setIsTokensDrawerOpen(true)}
      />

      {/* Hero Section */}
      <section className="bg-white border-b border-stone-200/70 pt-8 pb-16 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-7 space-y-6">
            <h1 className="text-5xl sm:text-7xl font-black text-stone-900 tracking-tight leading-[1.05]">
              Restaurants,<br />
              bukas,<br />
              and combos.
            </h1>

            <p className="text-stone-500 text-sm sm:text-base max-w-md leading-relaxed">
              Order fresh campus meals ahead, skip the physical lines, and track your kitchen pickup token in real time.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={scrollToExplore}
                className="bg-stone-900 hover:bg-black text-white font-bold px-7 py-3.5 rounded-full flex items-center gap-2 text-sm transition shadow-md active:scale-95"
              >
                <span>Browse restaurants</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleOpenPlaceOrder('Jroyals')}
                className="bg-brand hover:bg-brand-hover text-white font-bold px-7 py-3.5 rounded-full flex items-center gap-2 text-sm transition shadow-md shadow-brand/20 active:scale-95"
              >
                <Utensils className="w-4 h-4" />
                <span>Place Order by Vendor & Items</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-sm flex items-center justify-center">
              <img
                src="/hero-mascot.png"
                alt="CampusChow Meals"
                className="w-full max-h-80 object-contain drop-shadow-xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
              <div 
                style={{ display: 'none' }} 
                className="w-72 h-72 rounded-full bg-orange-100 border-4 border-white shadow-2xl flex flex-col items-center justify-center p-6 text-center animate-pulse"
              >
                <div className="text-7xl mb-2">🛍️🍗</div>
                <span className="text-lg font-black text-stone-900">CampusChow</span>
                <span className="text-xs text-stone-500 font-semibold">Fresh Meals & Pickup Tokens</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Content & Ordering Section */}
      <main id="browse-section" className="max-w-7xl mx-auto px-6 sm:px-12 pt-12">
        
        <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight mb-8">
          Order food and groceries
        </h2>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl border border-stone-200 shadow-sm mb-6">
          <div className="flex items-center gap-3 px-3 py-2 flex-1 w-full">
            <Search className="w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Jollof, rice, a store name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none text-stone-800 placeholder-stone-400"
            />
          </div>

          <div className="relative border-t sm:border-t-0 sm:border-l border-stone-200 px-4 py-2 w-full sm:w-auto">
            <button className="flex items-center justify-between sm:justify-start gap-4 text-xs font-semibold text-stone-600 w-full">
              <span>{selectedArea}</span>
              <ChevronDown className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-6 overflow-x-auto pb-4 mb-10 border-b border-stone-200/60 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 pb-2 transition relative ${
              activeTab === 'all' ? 'text-brand font-bold border-b-2 border-brand' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>⊞</span>
            <span>All</span>
          </button>

          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex items-center gap-2 pb-2 transition relative ${
              activeTab === 'restaurants' ? 'text-brand font-bold border-b-2 border-brand' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>🛍️</span>
            <span>Restaurants</span>
          </button>

          <button
            onClick={() => setActiveTab('bukas')}
            className={`flex items-center gap-2 pb-2 transition relative ${
              activeTab === 'bukas' ? 'text-brand font-bold border-b-2 border-brand' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>🥣</span>
            <span>Bukas</span>
          </button>

          <button
            onClick={() => setActiveTab('groceries')}
            className={`flex items-center gap-2 pb-2 transition relative ${
              activeTab === 'groceries' ? 'text-brand font-bold border-b-2 border-brand' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>🛒</span>
            <span>Groceries</span>
          </button>
        </div>

        {/* Combos Section */}
        <section className="mb-14">
          <h3 className="text-2xl font-black text-stone-900 tracking-tight mb-4">
            Combos
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {filteredCombos.map((combo) => (
              <div
                key={combo.id}
                onClick={() => handleAddToCart(combo)}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-44 bg-amber-50">
                  <img
                    src={combo.image}
                    alt={combo.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-sm font-bold text-brand leading-snug line-clamp-1">
                      {combo.name}
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">☆ {combo.rating}</p>
                    <p className="text-xs text-stone-500 mt-1">{combo.vendor}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="font-extrabold text-stone-900 text-sm">
                      ₦{combo.price.toLocaleString()}
                    </span>
                    <button className="bg-brand/10 text-brand p-1.5 rounded-full hover:bg-brand hover:text-white transition">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stores Section */}
        <section className="mb-14">
          <h3 className="text-2xl font-black text-stone-900 tracking-tight mb-4">
            Restaurants and stores
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {STORES_DATA.map((store) => (
              <div
                key={store.id}
                onClick={() => handleOpenPlaceOrder(store.name)}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition cursor-pointer"
              >
                <div className={`relative h-44 flex items-center justify-center text-4xl font-black ${store.bgColor}`}>
                  {store.isClosed && (
                    <span className="absolute top-3 left-3 bg-black/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                      Closed
                    </span>
                  )}
                  <span>{store.avatar}</span>
                </div>

                <div className="p-4">
                  <h4 className="text-sm font-bold text-stone-900">{store.name}</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">☆ {store.rating}</p>
                  <p className="text-xs text-stone-500 mt-1">
                    {store.category} · {store.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Floating Tray Button */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-brand text-white font-bold py-3.5 px-6 rounded-full shadow-2xl flex items-center gap-3 hover:bg-brand-hover transition active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Tray ({totalCount})</span>
            </button>
          </div>
        )}

      </main>

      {/* Modals & Slide-Over Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setPendingAction(null);
          setPendingOrderData(null);
        }}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (pendingAction === 'tray_checkout' && pendingOrderData) {
            executeTrayCheckout(pendingOrderData.notes, pendingOrderData.total, user);
            setPendingAction(null);
            setPendingOrderData(null);
          } else if (pendingAction === 'quick_order' && pendingOrderData) {
            executeQuickOrder(pendingOrderData, user);
            setPendingAction(null);
            setPendingOrderData(null);
          }
        }}
      />

      <ActiveTokensDrawer
        isOpen={isTokensDrawerOpen}
        onClose={() => setIsTokensDrawerOpen(false)}
        activeOrder={activeOrder}
        onCompleteOrder={handleCompleteOrder}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={(id) => setCartItems((prev) => prev.filter((i) => i.id !== id))}
        onProceedToOrder={handleProceedToOrder}
      />

      <PlaceOrderModal
        isOpen={isPlaceOrderOpen}
        onClose={() => setIsPlaceOrderOpen(false)}
        onGenerateToken={handleQuickPlaceOrder}
        defaultVendor={activeVendorSelection}
      />
    </div>
  );
}