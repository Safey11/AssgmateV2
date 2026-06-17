"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function ReferralPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user/me").then((r) => r.json()).then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, []);

  const referralLink = user ? `https://assgmate-v2.vercel.app/register?ref=${user.referralCode}` : "";

  function handleCopy() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShare() {
    const text = `Yaar assignment se thak gaye ho? 😩 Maine ek AI tool use kar raha hoon — apna question paste karo aur Word, PDF, Excel ya PowerPoint file seconds mein download karo. Bilkul free hai! Try karo: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  if (loading) return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-white/40">Loading...</div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/10 relative">
        <span className="text-xl font-bold tracking-tight">Assign<span className="text-violet-400">Mate</span></span>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition">Dashboard</Link>
          <Link href="/generate" className="text-sm text-white/60 hover:text-white transition">Generate</Link>
          <button
            onClick={async () => { await signOut({ redirect: false }); window.location.href = "/login"; }}
            className="text-sm bg-white/5 border border-white/10 hover:border-white/30 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>

        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#111] border-b border-white/10 flex flex-col px-6 py-4 gap-4 md:hidden z-50">
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm text-white/60 hover:text-white transition">Dashboard</Link>
            <Link href="/generate" onClick={() => setMenuOpen(false)} className="text-sm text-white/60 hover:text-white transition">Generate</Link>
          </div>
        )}
      </nav>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">

        <div className="mb-8 text-center">
          <span className="text-5xl">🎁</span>
          <h1 className="text-2xl md:text-3xl font-bold mt-4">Invite Friends, Get Rewards</h1>
          <p className="text-white/40 mt-2">You and your friend both get 2 free bonus generations.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <span className="text-3xl">👥</span>
            <p className="text-2xl font-bold mt-2">{user?.referralCount || 0}</p>
            <p className="text-white/40 text-sm">Friends invited</p>
          </div>
          <div className="bg-violet-600/10 border border-violet-500/20 rounded-2xl p-5 text-center">
            <span className="text-3xl">⚡</span>
            <p className="text-2xl font-bold mt-2 text-violet-400">{user?.bonusGenerations || 0}</p>
            <p className="text-white/40 text-sm">Bonus generations earned</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Your Referral Link</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 outline-none"
            />
            <button
              onClick={handleCopy}
              className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl text-sm font-semibold transition shrink-0"
            >
              {copied ? "✅ Copied!" : "📋 Copy"}
            </button>
          </div>

          <button
            onClick={handleShare}
            className="w-full mt-4 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-400 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            💬 Share on WhatsApp
          </button>
        </div>

        {/* How it works */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">How it works</h2>
          <div className="flex flex-col gap-4">
            {[
              { step: "1", text: "Share your unique referral link with friends" },
              { step: "2", text: "They sign up using your link" },
              { step: "3", text: "You both get 2 bonus generations instantly" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <p className="text-white/60 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}