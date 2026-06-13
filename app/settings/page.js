"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [nameForm, setNameForm] = useState({ name: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setNameForm({ name: data.name || "" });
        setLoading(false);
      });
  }, []);

  async function handleUpdateName() {
    if (!nameForm.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameForm.name }),
      });
      const data = await res.json();
      if (!res.ok) return setMessage({ type: "error", text: data.error });
      setUser((prev) => ({ ...prev, name: nameForm.name }));
      setMessage({ type: "success", text: "Name updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleUpdatePassword() {
    if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
      return setMessage({ type: "error", text: "All fields required" });
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      return setMessage({ type: "error", text: "Passwords don't match" });
    }
    if (passwordForm.newPass.length < 6) {
      return setMessage({ type: "error", text: "Password must be at least 6 characters" });
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.newPass }),
      });
      const data = await res.json();
      if (!res.ok) return setMessage({ type: "error", text: data.error });
      setPasswordForm({ current: "", newPass: "", confirm: "" });
      setMessage({ type: "success", text: "Password updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
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

        {/* Desktop Nav */}
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

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#111] border-b border-white/10 flex flex-col px-6 py-4 gap-4 md:hidden z-50">
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm text-white/60 hover:text-white transition">Dashboard</Link>
            <Link href="/generate" onClick={() => setMenuOpen(false)} className="text-sm text-white/60 hover:text-white transition">Generate</Link>
            <button
              onClick={async () => { await signOut({ redirect: false }); window.location.href = "/login"; }}
              className="text-sm bg-white/5 border border-white/10 px-4 py-2 rounded-lg transition text-left"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Settings ⚙️</h1>
          <p className="text-white/40 mt-2">Manage your account details.</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Account Info</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-violet-600 flex items-center justify-center text-xl font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{user?.name}</p>
              <p className="text-white/40 text-sm truncate">{user?.email}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full border mt-1 inline-block ${
                user?.plan === "pro"
                  ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                  : "bg-white/5 text-white/40 border-white/10"
              }`}>
                {user?.plan?.toUpperCase()} Plan
              </span>
            </div>
          </div>

          {/* Update Name */}
          <div className="flex flex-col gap-3">
            <label className="text-sm text-white/60">Full Name</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={nameForm.name}
                onChange={(e) => setNameForm({ name: e.target.value })}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition"
              />
              <button
                onClick={handleUpdateName}
                disabled={saving}
                className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 px-4 py-3 rounded-xl text-sm font-semibold transition shrink-0"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-white/60 mb-1 block">Current Password</label>
              <input
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">New Password</label>
              <input
                type="password"
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20"
              />
            </div>
            <button
              onClick={handleUpdatePassword}
              disabled={saving}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 py-3 rounded-xl font-semibold transition"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6">
          <h2 className="text-lg font-semibold mb-3">Your Plan</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{user?.plan === "pro" ? "Pro Plan" : "Free Plan"}</p>
              <p className="text-white/40 text-sm mt-1">
                {user?.plan === "pro"
                  ? "Unlimited generations"
                  : `${user?.generationsUsed || 0}/5 generations used`}
              </p>
            </div>
            {user?.plan !== "pro" && (
              <Link href="/pricing" className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0">
                Upgrade
              </Link>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}