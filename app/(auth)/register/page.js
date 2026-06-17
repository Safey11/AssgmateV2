"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referredBy = searchParams.get("ref");

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", terms: false });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  }

  async function handleSubmit() {
    setError(null);
    if (!form.name || !form.email || !form.password) return setError("All fields required");
    if (form.password !== form.confirm) return setError("Passwords don't match");
    if (!form.terms) return setError("Please accept the Terms of Service and Privacy Policy");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          referredBy: referredBy || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      router.push("/login");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Assign<span className="text-violet-400">Mate</span></h1>
        <p className="text-white/40 text-sm mt-2">Create your account</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-2">Get started for free</h2>

        {referredBy && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-2 mb-4">
            <p className="text-violet-400 text-sm">🎁 You'll get 2 bonus generations from your referral!</p>
          </div>
        )}

        <div className="flex flex-col gap-4 mt-4">
          <div>
            <label className="text-sm text-white/60 mb-1 block">Full Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Confirm Password</label>
            <input
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
              className="mt-1 accent-violet-500"
            />
            <label htmlFor="terms" className="text-sm text-white/40 leading-relaxed">
              I agree to the{" "}
              <a href="/terms" target="_blank" className="text-violet-400 hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" target="_blank" className="text-violet-400 hover:underline">Privacy Policy</a>
            </label>
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-400 hover:underline">Login</Link>
        </p>
      </div>

    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-white/40">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}