"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    setError(null);
    if (!form.email || !form.password) return setError("All fields required");

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (!res || res.error) {
        setError("Invalid email or password");
        return;
      }

      window.location.href = "/dashboard";
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
          <p className="text-white/40 text-sm mt-2">Welcome back</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">Login to your account</h2>

          <div className="flex flex-col gap-4">
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
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <p className="text-center text-white/40 text-sm">
              <Link href="/forgot-password" className="text-violet-400 hover:underline">Forgot password?</Link>
            </p>
            <p className="text-center text-white/40 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-violet-400 hover:underline">Register</Link>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}