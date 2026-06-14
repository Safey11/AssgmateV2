"use client";

import { useState } from "react";

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [expandedUser, setExpandedUser] = useState(null);

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
      if (!res.ok) { setMessage({ type: "error", text: data.error }); return; }
      setUsers((prev) => prev.map((u) => u.email === email ? { ...u, plan: newPlan, generationsUsed: 0 } : u));
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
      if (!res.ok) return;
      setUsers((prev) => prev.map((u) => u.email === email ? { ...u, generationsUsed: 0 } : u));
      setMessage({ type: "success", text: `${email} limit reset` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(email) {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, adminKey }),
      });
      if (!res.ok) { setMessage({ type: "error", text: "Delete failed" }); return; }
      setUsers((prev) => prev.filter((u) => u.email !== email));
      setMessage({ type: "success", text: `${email} deleted` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Delete failed" });
    }
  }

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingPayments = users.filter((u) => u.pendingPayment?.status === "pending");

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
            {message && <p className="text-red-400 text-sm mb-4">{message.text}</p>}
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
      <nav className="flex items-center justify-between px-4 md:px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">
          Assign<span className="text-violet-400">Mate</span>
          <span className="text-white/40 text-sm ml-2">Admin</span>
        </span>
        <span className="text-white/40 text-sm">{users.length} users</span>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Admin Panel</h1>
          <p className="text-white/40 mt-2 text-sm">Manage users and payments.</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Users", value: users.length, icon: "👥" },
            { label: "Pro Users", value: users.filter((u) => u.plan === "pro").length, icon: "⚡" },
            { label: "Free Users", value: users.filter((u) => u.plan === "free").length, icon: "🆓" },
            { label: "Pending Payments", value: pendingPayments.length, icon: "💰" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <span className="text-xl">{s.icon}</span>
              <p className="text-xl md:text-2xl font-bold mt-2">{s.value}</p>
              <p className="text-white/40 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "users"
                ? "bg-violet-600 text-white"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === "payments"
                ? "bg-violet-600 text-white"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            Payments
            {pendingPayments.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pendingPayments.length}
              </span>
            )}
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20 mb-4"
            />

            <div className="flex flex-col gap-3">
              {filtered.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-10 text-center text-white/30 text-sm">
                  No users found
                </div>
              ) : (
                filtered.map((user) => (
                  <div key={user._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    {/* User Row */}
                    <div
                      className="flex items-center justify-between px-4 md:px-6 py-4 cursor-pointer"
                      onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-white/40 text-xs truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full border hidden sm:block ${
                          user.plan === "pro"
                            ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                            : "bg-white/5 text-white/40 border-white/10"
                        }`}>
                          {user.plan.toUpperCase()}
                        </span>
                        <span className="text-white/40 text-xs">{expandedUser === user._id ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {/* Expanded Actions */}
                    {expandedUser === user._id && (
                      <div className="border-t border-white/10 px-4 md:px-6 py-4 bg-white/5">
                        <div className="flex flex-wrap gap-2 items-center justify-between">
                          <div className="text-xs text-white/40">
                            <span className="mr-3">{user.generationsUsed} generations used</span>
                            <span className={user.plan === "pro" ? "text-violet-400" : "text-white/40"}>
                              {user.plan.toUpperCase()} Plan
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
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
                              Reset Limit
                            </button>
                            <button
                              onClick={() => handleDelete(user.email)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="flex flex-col gap-3">
            {pendingPayments.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-10 text-center text-white/30 text-sm">
                No pending payments
              </div>
            ) : (
              pendingPayments.map((user) => (
                <div key={user._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-white/40 text-sm">{user.email}</p>
                      <p className="text-white/30 text-xs mt-1">
                        Submitted: {new Date(user.pendingPayment.submittedAt).toLocaleString("en-PK")}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      {user.pendingPayment.receiptUrl && (
                        
                         <a href={user.pendingPayment.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs bg-white/5 border border-white/10 hover:border-white/30 px-3 py-2 rounded-lg transition text-violet-400"
                        >
                          🧾 View Receipt
                        </a>
                      )}
                      <button
                        onClick={() => handleUpgrade(user.email, "free")}
                        className="text-xs bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition font-semibold"
                      >
                        ✅ Approve & Upgrade
                      </button>
                      <button
                        onClick={async () => {
                          await fetch("/api/admin/upgrade", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: user.email, adminKey, rejectPayment: true }),
                          });
                          setUsers((prev) => prev.map((u) =>
                            u.email === user.email
                              ? { ...u, pendingPayment: { ...u.pendingPayment, status: "rejected" } }
                              : u
                          ));
                          setMessage({ type: "success", text: `Payment rejected for ${user.email}` });
                          setTimeout(() => setMessage(null), 3000);
                        }}
                        className="text-xs border border-red-500/20 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </main>
  );
}