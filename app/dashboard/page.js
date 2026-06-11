"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ generated: 0, plan: "Free" });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const FORMAT_ICONS = {
    word: "📝",
    pdf: "📄",
    excel: "📊",
    pptx: "📽️",
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [historyRes, userRes] = await Promise.all([
          fetch("/api/history"),
          fetch("/api/user/me"),
        ]);
        const history = await historyRes.json();
        const user = await userRes.json();
        setStats({ generated: history.length, plan: user.plan || "Free" });
        setRecent(history.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">Assign<span className="text-violet-400">Mate</span></span>
        <div className="flex items-center gap-6">
          <Link href="/generate" className="text-sm text-white/60 hover:text-white transition">Generate</Link>
          <Link href="/history" className="text-sm text-white/60 hover:text-white transition">History</Link>
          <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition">Pricing</Link>
          <Link href="/settings" className="text-sm text-white/60 hover:text-white transition">Settings</Link>
          <button
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = "/login";
            }}
            className="text-sm bg-white/5 border border-white/10 hover:border-white/30 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold">
            Welcome back {session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-white/40 mt-2">What do you need to get done today?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Assignments Generated", value: loading ? "..." : stats.generated, icon: "📝" },
            { label: "Files Downloaded", value: loading ? "..." : stats.generated, icon: "📥" },
            { label: "Plan", value: loading ? "..." : stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1), icon: "⚡" },
          ].map((stat) => (
            <div key={stat.label} className={`bg-white/5 border rounded-2xl p-6 ${stat.label === "Plan" && stats.plan === "pro"
                ? "border-violet-500/40 bg-violet-600/10"
                : "border-white/10"
              }`}>
              <span className="text-2xl">{stat.icon}</span>
              <p className={`text-3xl font-bold mt-3 ${stat.label === "Plan" && stats.plan === "pro" ? "text-violet-400" : ""
                }`}>{stat.value}</p>
              <p className="text-white/40 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <Link href="/generate" className="bg-violet-600/10 border border-violet-500/20 hover:border-violet-500/50 rounded-2xl p-6 transition group">
            <span className="text-3xl">✨</span>
            <h3 className="text-lg font-semibold mt-3 group-hover:text-violet-400 transition">Generate Assignment</h3>
            <p className="text-white/40 text-sm mt-1">Paste your question and get a ready to submit file</p>
          </Link>
          <Link href="/history" className="bg-white/5 border border-white/10 hover:border-white/30 rounded-2xl p-6 transition group">
            <span className="text-3xl">🕐</span>
            <h3 className="text-lg font-semibold mt-3 group-hover:text-white transition">View History</h3>
            <p className="text-white/40 text-sm mt-1">See all your previously generated assignments</p>
          </Link>
        </div>

        {/* Recent */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Assignments</h2>
            <Link href="/history" className="text-violet-400 text-sm hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-white/10 rounded w-1/3 mb-2"></div>
                  <div className="h-2 bg-white/5 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-white/30">
              <span className="text-4xl mb-3">📭</span>
              <p className="text-sm">No assignments yet. Generate your first one!</p>
              <Link href="/generate" className="mt-4 text-violet-400 text-sm hover:underline">
                Generate now →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.map((a) => (
                <div key={a._id} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{FORMAT_ICONS[a.format]}</span>
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{a.question}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-1 rounded-full">
                    {a.format.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}