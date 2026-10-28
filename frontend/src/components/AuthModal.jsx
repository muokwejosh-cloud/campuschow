import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(true);
  const [roleIntent, setRoleIntent] = useState('student'); // 'student' (Order food) or 'vendor' (Sell food)
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.phone || !formData.password) {
      setErrorMsg('Please provide your phone number and password.');
      return;
    }
    if (isRegister && !formData.name) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);
    const endpoint = isRegister
      ? 'http://localhost:5000/api/auth/register'
      : 'http://localhost:5000/api/auth/login';

    const payload = {
      phone: formData.phone,
      password: formData.password,
      role: roleIntent,
      ...(isRegister && { name: formData.name, email: formData.email }),
      ...(isRegister && roleIntent === 'vendor' && { storeName: formData.name ? `${formData.name}'s Kitchen` : 'Campus Kiosk' }),
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed. Please check credentials.');
      }

      localStorage.setItem('campuschow_token', data.token);
      localStorage.setItem('campuschow_user', JSON.stringify(data.user));

      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl p-8 sm:p-12 shadow-2xl relative border border-stone-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Form Column */}
          <div className="md:col-span-7">
            <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight mb-6">
              {isRegister ? 'Join CampusChow' : 'Sign in to CampusChow'}
            </h1>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Radio Selection: Who are you (No riders) */}
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2">
                    What brings you to CampusChow?
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setRoleIntent('student')}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left text-sm font-medium transition ${
                        roleIntent === 'student'
                          ? 'border-brand bg-brand/5 text-stone-900 font-bold'
                          : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${roleIntent === 'student' ? 'border-brand' : 'border-stone-300'}`}>
                        {roleIntent === 'student' && <div className="w-2 h-2 rounded-full bg-brand" />}
                      </div>
                      <span>Order food</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRoleIntent('vendor')}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left text-sm font-medium transition ${
                        roleIntent === 'vendor'
                          ? 'border-brand bg-brand/5 text-stone-900 font-bold'
                          : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${roleIntent === 'vendor' ? 'border-brand' : 'border-stone-300'}`}>
                        {roleIntent === 'vendor' && <div className="w-2 h-2 rounded-full bg-brand" />}
                      </div>
                      <span>Sell food</span>
                    </button>
                  </div>
                </div>
              )}

              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800 placeholder-stone-400"
                  />
                </div>
              )}

              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800 placeholder-stone-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Phone Number {isRegister ? '' : ''}
                </label>
                <input
                  type="tel"
                  placeholder="0803 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800 placeholder-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-brand text-sm text-stone-800 placeholder-stone-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-3.5 px-6 rounded-xl text-sm transition active:scale-[0.99] mt-3 disabled:opacity-50"
              >
                {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-5 text-left">
              <p className="text-xs text-stone-500">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setIsRegister(!isRegister);
                  }}
                  className="text-brand font-bold hover:underline"
                >
                  {isRegister ? 'Sign in' : 'Create account'}
                </button>
              </p>
            </div>
          </div>

          {/* Right Column: Cartoon Mascot & Food Illustration */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-[280px] p-4 bg-stone-50 rounded-3xl border border-stone-100 flex flex-col items-center text-center">
              <div className="w-40 h-40 rounded-2xl bg-amber-100 flex items-center justify-center text-5xl mb-4 shadow-inner">
                🥡🍗
              </div>
              <h3 className="font-black text-stone-900 text-base">Campus Meals On Demand</h3>
              <p className="text-xs text-stone-500 mt-1">
                Order your favorite campus dishes or set up your kitchen kiosk in seconds.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}