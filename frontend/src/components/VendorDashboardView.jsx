import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  Soup, 
  Store, 
  Wallet, 
  User, 
  Clock,
  Flame,
  Check,
  CheckCheck,
  LogOut,
  Bell,
  Moon,
  ChevronDown
} from 'lucide-react';
import { socket } from '../socket';

export default function VendorDashboardView({ user, onLogout }) {
  const [activeSidebarTab, setActiveSidebarTab] = useState('orders'); // 'orders' | 'restaurant' | etc.
  const [restaurantType, setRestaurantType] = useState('Restaurant');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menuForm, setMenuForm] = useState({ name: '', price: '', description: '' });
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.kitchenName || user?.storeName || 'Campus Kiosk',
    cuisine: 'Nigerian, grills, soups, swallow',
    description: 'Fresh local campus delicacies served hot and fresh during lecture breaks.',
    area: user?.campusLocation || 'SUB Campus Complex',
    streetAddress: 'Block B, Sub Cafeteria Wing',
    phone: user?.phone || '0803 000 0000'
  });

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders', { headers: { Authorization: `Bearer ${localStorage.getItem('campuschow_token')}` } });
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

  const fetchMenu = async () => {
    const response = await fetch('http://localhost:5000/api/vendor/menu', { headers: { Authorization: `Bearer ${localStorage.getItem('campuschow_token')}` } });
    if (response.ok) setMenuItems(await response.json());
  };

  useEffect(() => {
    fetchOrders();
    fetchMenu();

    socket.on('new-order', (newOrder) => {
      setOrders((prev) => [newOrder, ...prev.filter((o) => o._id !== newOrder._id)]);
    });

    socket.on('order-status-updated', (updated) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? { ...o, status: updated.status } : o))
      );
    });

    return () => {
      socket.off('new-order');
      socket.off('order-status-updated');
    };
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('campuschow_token')}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const addMenuItem = async event => {
    event.preventDefault();
    const response = await fetch('http://localhost:5000/api/vendor/menu', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('campuschow_token')}` }, body: JSON.stringify(menuForm) });
    const result = await response.json();
    if (!response.ok) return alert(result.message || 'Could not add menu item.');
    setMenuItems(items => [...items, result]); setMenuForm({ name: '', price: '', description: '' });
  };

  const toggleMenuItem = async item => {
    const response = await fetch(`http://localhost:5000/api/vendor/menu/${item._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('campuschow_token')}` }, body: JSON.stringify({ isAvailable: !item.isAvailable }) });
    if (response.ok) { const updated = await response.json(); setMenuItems(items => items.map(row => row._id === updated._id ? updated : row)); }
  };

  const editMenuItem = async item => {
    const name = window.prompt('Meal name', item.name);
    if (name === null || !name.trim()) return;
    const price = window.prompt('Price in naira', String(item.price));
    if (price === null || !Number.isFinite(Number(price)) || Number(price) <= 0) return;
    const description = window.prompt('Short description', item.description || '');
    if (description === null) return;
    const response = await fetch(`http://localhost:5000/api/vendor/menu/${item._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('campuschow_token')}` }, body: JSON.stringify({ name: name.trim(), price: Number(price), description }) });
    if (response.ok) { const updated = await response.json(); setMenuItems(items => items.map(row => row._id === updated._id ? updated : row)); }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-stone-900 flex flex-col font-sans">
      
      {/* Vendor Top Navigation Bar */}
      <header className="bg-white border-b border-stone-200 px-6 sm:px-12 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-10">
          <span className="text-3xl font-black text-brand lowercase tracking-tight">
            campuschow
          </span>

          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-stone-600">
            <button 
              onClick={() => setActiveSidebarTab('orders')}
              className={`hover:text-stone-900 transition ${activeSidebarTab === 'orders' ? 'text-brand font-bold' : ''}`}
            >
              Kitchen Orders
            </button>
            <button 
              onClick={() => setActiveSidebarTab('restaurant')}
              className={`hover:text-stone-900 transition ${activeSidebarTab === 'restaurant' ? 'text-brand font-bold' : ''}`}
            >
              For restaurants
            </button>
            <span className="text-stone-300">|</span>
            <span className="text-xs text-stone-400 font-normal">Campus Kiosk Terminal</span>
          </nav>
        </div>

        {/* Right Vendor Controls */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition">
            <Moon className="w-4 h-4" />
          </button>
          
          <button className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition relative">
            <Bell className="w-4 h-4" />
            {orders.some((o) => o.status !== 'Completed') && (
              <span className="w-2 h-2 rounded-full bg-brand absolute top-1.5 right-1.5" />
            )}
          </button>

          {/* Vendor User Pill & Logout */}
          <div className="flex items-center gap-2 border border-stone-200 rounded-full pl-3 pr-2 py-1 bg-stone-50 text-xs font-bold text-stone-800">
            <span>{user?.name || user?.storeName || 'Vendor'}</span>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1 hover:text-red-600 hover:bg-stone-200 rounded-full transition ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Page Body: Sidebar + Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-12 py-10 flex flex-col md:flex-row gap-12">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-60 flex-shrink-0">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
            Your restaurant
          </p>

          <nav className="space-y-1.5">
            {[
              { 
                id: 'orders', 
                label: 'Orders', 
                icon: ShoppingBag, 
                count: orders.filter((o) => o.status !== 'Completed').length 
              },
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
                      : 'text-stone-600 hover:bg-white hover:text-stone-900 border border-transparent hover:border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-brand text-white' : 'bg-stone-200 text-stone-700'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content View */}
        <main className="flex-1">
          
          {/* Orders / Live Queue Tab */}
          {activeSidebarTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                    Kitchen Order Queue
                  </h1>
                  <p className="text-stone-500 text-sm mt-1">
                    Manage incoming pickup tokens and update readiness in real-time.
                  </p>
                </div>

                <button
                  onClick={fetchOrders}
                  className="text-xs bg-white border border-stone-200 hover:bg-stone-50 font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
                >
                  Refresh Queue
                </button>
              </div>

              {loadingOrders ? (
                <div className="p-16 text-center text-stone-400 text-sm font-medium">
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center text-stone-500 shadow-sm">
                  <Clock className="w-12 h-12 mx-auto text-stone-300 mb-3" />
                  <p className="font-bold text-stone-800 text-base">No active orders</p>
                  <p className="text-xs text-stone-400 mt-1">Incoming tokens will alert and display here live.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {orders.map((order) => {
                    const isAlmostReady = order.status === 'Almost Ready';
                    const isReady = order.status === 'Ready';
                    const isCompleted = order.status === 'Completed';

                    return (
                      <div
                        key={order._id}
                        className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition ${
                          isCompleted ? 'border-emerald-200 bg-emerald-50/20 opacity-80' : 'border-stone-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-black text-brand tracking-tight">
                              {order.tokenNo}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isReady
                                  ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                                  : isAlmostReady
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {order.status || 'Pending'}
                            </span>
                          </div>

                          <div className="space-y-1.5 py-3 border-y border-stone-100">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-stone-600">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="font-semibold text-stone-800">
                                  ₦{(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>

                          {order.notes && (
                            <div className="mt-3 text-xs bg-stone-50 p-2.5 rounded-xl text-stone-600 border border-stone-100">
                              <span className="font-bold text-stone-800">Note: </span>
                              {order.notes}
                            </div>
                          )}

                          <div className="mt-4 flex justify-between items-center text-xs">
                            <span className="text-stone-400">Total Price</span>
                            <span className="font-black text-base text-stone-900">
                              ₦{order.totalAmount?.toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold">
                            <span className="rounded-full bg-stone-100 px-2.5 py-1">Kiosk pickup</span>
                            <span className={`rounded-full px-2.5 py-1 ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{order.paymentMethod === 'online' && order.paymentStatus === 'paid' ? 'PAID ONLINE' : order.paymentStatus === 'paid' ? 'PAID AT COUNTER' : 'PAY AT COUNTER'}</span>
                            {order.studentId?.name && <span className="rounded-full bg-stone-100 px-2.5 py-1">{order.studentId.name} · {order.studentId.phone}</span>}
                          </div>
                        </div>

                        {/* Order Status Action Controls */}
                        <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col gap-2">
                          {isCompleted ? (
                            <div className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center justify-center gap-1.5">
                              <CheckCheck className="w-4 h-4 text-emerald-600" />
                              <span>Order Picked Up & Completed</span>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                                  disabled={order.status !== 'Pending'}
                                  className="py-2 px-3 rounded-xl text-xs font-bold bg-brand text-white disabled:bg-stone-100 disabled:text-stone-400"
                                >Start Preparing</button>
                                <button
                                  onClick={() => handleUpdateStatus(order._id, 'Almost Ready')}
                                  disabled={order.status !== 'Preparing'}
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
                                  disabled={!['Preparing', 'Almost Ready'].includes(order.status)}
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

                              {/* Vendor can hand over food and finalize completed state */}
                              {isReady && (
                                <button
                                  onClick={() => handleUpdateStatus(order._id, 'Completed')}
                                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-black text-white transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                                >
                                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                                  <span>Handed Over & Completed</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeSidebarTab === 'menu' && <section>
            <h1 className="text-3xl font-black mb-2">Your kitchen menu</h1><p className="text-sm text-stone-500 mb-6">Items you add here appear in your public kitchen menu.</p>
            <form onSubmit={addMenuItem} className="bg-white rounded-2xl border p-5 grid md:grid-cols-4 gap-3 mb-6"><input required maxLength={100} placeholder="Meal name" value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} className="border rounded-xl p-3 text-sm"/><input required type="number" min="1" placeholder="Price (₦)" value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} className="border rounded-xl p-3 text-sm"/><input maxLength={300} placeholder="Description" value={menuForm.description} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} className="border rounded-xl p-3 text-sm"/><button className="bg-brand text-white rounded-xl px-4 py-3 font-bold">Add item</button></form>
            <div className="space-y-3">{menuItems.map(item => <article key={item._id} className="bg-white border rounded-2xl p-4 flex justify-between items-center"><div><h2 className="font-bold">{item.name} · ₦{item.price.toLocaleString()}</h2><p className="text-xs text-stone-500 mt-1">{item.description}</p></div><div className="flex gap-2"><button onClick={() => editMenuItem(item)} className="rounded-full px-3 py-2 text-xs font-bold bg-stone-100">Edit</button><button onClick={() => toggleMenuItem(item)} className={`rounded-full px-3 py-2 text-xs font-bold ${item.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>{item.isAvailable ? 'Available · Hide' : 'Unavailable · Show'}</button></div></article>)}{!menuItems.length && <p className="text-sm text-stone-500">Add your first item to get started.</p>}</div>
          </section>}

          {activeSidebarTab === 'earnings' && <section><h1 className="text-3xl font-black mb-6">Revenue & payments</h1><div className="grid sm:grid-cols-3 gap-4">{[{ label: 'Orders', value: orders.length }, { label: 'Paid online', value: orders.filter(o => o.paymentStatus === 'paid' && o.paymentMethod === 'online').length }, { label: 'Revenue', value: `₦${orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}` }].map(stat => <article key={stat.label} className="bg-white border rounded-2xl p-5"><p className="text-xs text-stone-500">{stat.label}</p><strong className="text-2xl mt-2 block">{stat.value}</strong></article>)}</div></section>}

          {/* Add / Edit Restaurant Tab */}
          {activeSidebarTab === 'restaurant' && (
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                {user?.kitchenName || user?.storeName}
              </h1>
              <p className="text-stone-500 text-sm mt-2 mb-8 leading-relaxed">
                Tell customers who you are. CampusChow reviews every new restaurant before it goes live, and you can set up your menu while you wait.
              </p>

              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    Restaurant name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
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
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    Cuisine
                  </label>
                  <input
                    type="text"
                    value={formData.cuisine}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    placeholder="Nigerian, grills, soups..."
                    className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800 bg-white"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">What people should know about your food</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2">
                      Area
                    </label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="e.g. UNN Campus / Sub complex"
                      className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2">
                      Street address
                    </label>
                    <input
                      type="text"
                      value={formData.streetAddress}
                      onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                      placeholder="Counter number or block"
                      className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0803 000 0000"
                    className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800 bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => alert('Restaurant profile updated successfully!')}
                  className="bg-brand hover:bg-brand-hover text-white font-bold py-3.5 px-8 rounded-xl text-sm transition active:scale-95 shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeSidebarTab !== 'orders' && activeSidebarTab !== 'restaurant' && activeSidebarTab !== 'menu' && activeSidebarTab !== 'earnings' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center text-stone-400">
              <p className="font-bold text-stone-700 uppercase tracking-wider text-xs">Section Active</p>
              <p className="text-sm mt-1">{activeSidebarTab.toUpperCase()} management module is active.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
