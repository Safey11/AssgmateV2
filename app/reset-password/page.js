"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!form.password || !form.confirm) return setError("All fields required");
    if (form.password !== form.confirm) return setError("Passwords don't match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setSuccess(true);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <span className="text-5xl">❌</span>
        <h2 className="text-xl font-semibold mt-4 mb-2">Invalid Link</h2>
        <p className="text-white/40 text-sm">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="mt-6 inline-block text-violet-400 text-sm hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <span className="text-5xl">✅</span>
        <h2 className="text-xl font-semibold mt-4 mb-2">Password Reset!</h2>
        <p className="text-white/40 text-sm">Your password has been reset successfully.</p>
        <Link href="/login" className="mt-6 inline-block bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold transition">
          Login now
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-2">Set new password</h2>
      <p className="text-white/40 text-sm mb-6">Enter your new password below.</p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-white/60 mb-1 block">New Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20"
          />
        </div>
        <div>
          <label className="text-sm text-white/60 mb-1 block">Confirm Password</label>
          <input
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition mt-2"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Assign<span className="text-violet-400">Mate</span></h1>
          <p className="text-white/40 text-sm mt-2">Reset your password</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <Suspense fallback={<p className="text-white/40 text-sm">Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>

      </div>
    </main>
  );
}