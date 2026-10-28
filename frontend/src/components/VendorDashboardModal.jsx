import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  UtensilsCrossed, 
  Soup, 
  Store, 
  Wallet, 
  User, 
  CheckCircle2, 
  Clock,
  Flame,
  Check
} from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('https://campuschow-api.onrender.com');

export default function VendorDashboardModal({ isOpen, onClose }) {
  const [activeSidebarTab, setActiveSidebarTab] = useState('orders'); // default to Orders for quick kitchen management
  const [restaurantType, setRestaurantType] = useState('Restaurant');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const [formData, setFormData] = useState({
    name: 'Nourishing Kitchen',
    cuisine: 'Nigerian, grills, soups, swallow',
    description: 'Fresh local campus delicacies served hot and fresh during lecture breaks.',
    area: 'SUB Campus Complex',
    streetAddress: 'Block B, Sub Cafeteria Wing',
    phone: '0803 000 0000'
  });

  // Fetch all orders from backend when modal opens
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('https://campuschow-api.onrender.com/api/orders');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  // Real-time synchronization for new orders and external status changes
  useEffect(() => {
    socket.on('newOrder', (newOrder) => {
      setOrders((prev) => [newOrder, ...prev.filter((o) => o._id !== newOrder._id)]);
    });

    socket.on('orderStatusUpdated', (updated) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? { ...o, status: updated.status } : o))
      );
    });

    return () => {
      socket.off('newOrder');
      socket.off('orderStatusUpdated');
    };
  }, []);

  // Vendor Action: update status to Almost Ready or Ready
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`https://campuschow-api.onrender.com/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Could not update status');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-6xl h-[90vh] bg-[#FCFBF8] rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <div className="px-8 py-4 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-brand lowercase tracking-tight">campuschow</span>
            <span className="text-xs bg-stone-100 text-stone-600 font-bold px-2.5 py-1 rounded-full">
              Vendor Kitchen Terminal
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
                Your restaurant
              </p>

              <nav className="space-y-1.5">
                {[
                  { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
                  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
                  { id: 'combos', label: 'Combos', icon: Soup },
                  { id: 'restaurant', label: 'Restaurant', icon: Store },
                  { id: 'earnings', label: 'Earnings', icon: Wallet },
                  { id: 'account', label: 'Account', icon: User },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSidebarTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSidebarTab(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                        isActive
                          ? 'bg-brand/10 text-brand font-bold'
                          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-stone-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && item.count > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-brand text-white' : 'bg-stone-100 text-stone-600'}`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-stone-100 text-xs text-stone-400">
              Kitchen Terminal v1.0
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 sm:p-10">
            
            {/* Orders Screen */}
            {activeSidebarTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-stone-900 tracking-tight">
                      Kitchen Order Queue
                    </h2>
                    <p className="text-stone-500 text-sm mt-1">
                      Update order readiness in real-time to alert student pickup tokens.
                    </p>
                  </div>
                  <button
                    onClick={fetchOrders}
                    className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-3 py-2 rounded-xl transition"
                  >
                    Refresh Queue
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="p-12 text-center text-stone-400 text-sm font-medium">
                    Loading kitchen queue...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500 shadow-sm">
                    <Clock className="w-10 h-10 mx-auto text-stone-300 mb-3" />
                    <p className="font-bold text-stone-800">No active queue tokens</p>
                    <p className="text-xs text-stone-400 mt-1">Incoming student orders will appear here automatically.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orders.map((order) => {
                      const isPending = order.status === 'Pending' || !order.status;
                      const isAlmostReady = order.status === 'Almost Ready';
                      const isReady = order.status === 'Ready';

                      return (
                        <div
                          key={order._id}
                          className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            {/* Token Badge & Current Status */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-lg font-black text-brand tracking-tight">
                                {order.tokenNo}
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                  isReady
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isAlmostReady
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-stone-100 text-stone-700'
                                }`}
                              >
                                {order.status || 'Pending'}
                              </span>
                            </div>

                            {/* Item Breakdown */}
                            <div className="space-y-1 py-2 border-y border-stone-100">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs text-stone-600">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span className="font-semibold text-stone-800">
                                    ₦{(item.price * item.quantity).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Special notes */}
                            {order.notes && (
                              <div className="mt-2 text-[11px] bg-stone-50 p-2 rounded-xl text-stone-500 border border-stone-100">
                                <span className="font-bold text-stone-700">Note: </span>
                                {order.notes}
                              </div>
                            )}

                            <div className="mt-3 flex justify-between items-center text-xs">
                              <span className="text-stone-400">Total Price</span>
                              <span className="font-black text-sm text-stone-900">
                                ₦{order.totalAmount?.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Status Progression Action Buttons */}
                          <div className="mt-5 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'Almost Ready')}
                              disabled={isAlmostReady || isReady}
                              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                                isAlmostReady
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : isReady
                                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                              }`}
                            >
                              <Flame className="w-3.5 h-3.5" />
                              <span>{isAlmostReady ? 'Almost Ready' : 'Mark Almost Ready'}</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(order._id, 'Ready')}
                              disabled={isReady}
                              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                                isReady
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isReady ? 'Ready for Pickup' : 'Mark Ready'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Restaurant Profile Screen */}
            {activeSidebarTab === 'restaurant' && (
              <div className="max-w-3xl">
                <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                  Add your restaurant
                </h2>
                <p className="text-stone-500 text-sm mt-2 mb-8 leading-relaxed">
                  Tell customers who you are. Set up your kiosk details and configure your menu items so students can find you on campus.
                </p>

                <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Restaurant name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['Restaurant', 'Buka', 'Grocery store'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setRestaurantType(t)}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium transition ${
                            restaurantType === t
                              ? 'border-brand bg-brand/5 text-stone-900 font-bold'
                              : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${restaurantType === t ? 'border-brand' : 'border-stone-300'}`}>
                            {restaurantType === t && <div className="w-2 h-2 rounded-full bg-brand" />}
                          </div>
                          <span>{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Cuisine
                    </label>
                    <input
                      type="text"
                      value={formData.cuisine}
                      onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                      placeholder="Nigerian, grills, soups..."
                      className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                        Area
                      </label>
                      <input
                        type="text"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                        Street address / Room #
                      </label>
                      <input
                        type="text"
                        value={formData.streetAddress}
                        onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => alert('Restaurant profile updated!')}
                    className="bg-brand hover:bg-brand-hover text-white font-bold py-3.5 px-8 rounded-xl text-sm transition active:scale-95 shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeSidebarTab !== 'orders' && activeSidebarTab !== 'restaurant' && (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-400">
                <p className="font-bold text-stone-700 uppercase tracking-wider text-xs">Section Ready</p>
                <p className="text-sm mt-1">{activeSidebarTab.toUpperCase()} management tab is active.</p>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}