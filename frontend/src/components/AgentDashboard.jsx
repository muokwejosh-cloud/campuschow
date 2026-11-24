import React, { useEffect, useState } from 'react';

const api = 'http://localhost:5000';
export default function AgentDashboard({ user, onLogout }) {
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    fetch(`${api}/api/agent/summary`, { headers: { Authorization: `Bearer ${localStorage.getItem('campuschow_token')}` } })
      .then(response => response.ok ? response.json() : null)
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);
  const referralCode = summary?.referralCode || user.referralCode;
  return <main className="min-h-screen bg-[#FAF9F5] p-6 sm:p-12"><div className="max-w-5xl mx-auto">
    <header className="flex justify-between items-center mb-10"><div><a href="/" className="text-2xl font-black text-brand">campuschow</a><p className="text-sm text-stone-500">Sales agent dashboard · {user.name}</p></div><button onClick={onLogout} className="rounded-xl bg-stone-900 text-white px-4 py-2">Sign out</button></header>
    <h1 className="text-3xl font-black mb-6">Combo referrals</h1>
    <section className="bg-white rounded-2xl p-6 border space-y-4">
      <p>Share your combo link with students:</p>
      <code className="block p-3 bg-stone-50 rounded-xl break-all">{window.location.origin}/?ref={referralCode || 'Loading…'}</code>
      <p>Referral code: <b>{referralCode || 'Loading…'}</b></p>
      <p><b>{summary?.orders || 0}</b> orders generated</p>
      <p><b>₦{(summary?.commission || 0).toLocaleString()}</b> estimated commission (5%)</p>
    </section>
  </div></main>;
}
