"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");

  async function handleLogin() {
    if (!adminKey) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: "Wrong admin key" });
        return;
      }
      setUsers(data);
      setAuthenticated(true);
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade(email, currentPlan) {
    const newPlan = currentPlan === "pro" ? "free" : "pro";
    try {
      const res = await fetch("/api/admin/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, adminKey, plan: newPlan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        return;
      }
      setUsers((prev) =>
        prev.map((u) => u.email === email ? { ...u, plan: newPlan, generationsUsed: 0 } : u)
      );
      setMessage({ type: "success", text: `${email} → ${newPlan.toUpperCase()}` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Upgrade failed" });
    }
  }

  async function handleResetLimit(email) {
    try {
      const res = await fetch("/api/admin/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, adminKey, resetOnly: true }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setUsers((prev) =>
        prev.map((u) => u.email === email ? { ...u, generationsUsed: 0 } : u)
      );
      setMessage({ type: "success", text: `${email} limit reset` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Assign<span className="text-violet-400">Mate</span></h1>
            <p className="text-white/40 text-sm mt-2">Admin Panel</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-lg font-semibold mb-4">Enter Admin Key</h2>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Admin key..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20 mb-4"
            />
            {message && (
              <p className="text-red-400 text-sm mb-4">{message.text}</p>
            )}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 py-3 rounded-xl font-semibold transition"
            >
              {loading ? "Verifying..." : "Login"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">
          Assign<span className="text-violet-400">Mate</span>
          <span className="text-white/40 text-sm ml-2">Admin</span>
        </span>
        <span className="text-white/40 text-sm">{users.length} total users</span>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-white/40 mt-2">Upgrade or manage user plans with one click.</p>
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Users", value: users.length, icon: "👥" },
            { label: "Pro Users", value: users.filter((u) => u.plan === "pro").length, icon: "⚡" },
            { label: "Free Users", value: users.filter((u) => u.plan === "free").length, icon: "🆓" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-2xl font-bold mt-2">{s.value}</p>
              <p className="text-white/40 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20 mb-6"
        />

        {/* Users Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-white/10 text-xs text-white/40 uppercase tracking-wider">
            <span className="col-span-2">User</span>
            <span>Plan</span>
            <span>Generations</span>
            <span>Actions</span>
          </div>
          {filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-white/30 text-sm">No users found</div>
          ) : (
            filtered.map((user) => (
              <div key={user._id} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/5 transition">
                <div className="col-span-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{user.email}</p>
                </div>
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    user.plan === "pro"
                      ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                      : "bg-white/5 text-white/40 border-white/10"
                  }`}>
                    {user.plan.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-white/60">{user.generationsUsed} used</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpgrade(user.email, user.plan)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      user.plan === "pro"
                        ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                        : "border-violet-500/20 text-violet-400 hover:bg-violet-500/10"
                    }`}
                  >
                    {user.plan === "pro" ? "Downgrade" : "Upgrade"}
                  </button>
                  <button
                    onClick={() => handleResetLimit(user.email)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}