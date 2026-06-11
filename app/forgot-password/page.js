"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!email) return setError("Email required");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setSent(true);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Assign<span className="text-violet-400">Mate</span></h1>
          <p className="text-white/40 text-sm mt-2">Reset your password</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <span className="text-5xl">📧</span>
              <h2 className="text-xl font-semibold mt-4 mb-2">Check your email</h2>
              <p className="text-white/40 text-sm">
                If this email exists in our system you will receive a password reset link shortly.
              </p>
              <Link href="/login" className="mt-6 inline-block text-violet-400 text-sm hover:underline">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">Forgot password?</h2>
              <p className="text-white/40 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
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
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>

              <p className="text-center text-white/40 text-sm mt-6">
                Remember your password?{" "}
                <Link href="/login" className="text-violet-400 hover:underline">Login</Link>
              </p>
            </>
          )}
        </div>

      </div>
    </main>
  );
}