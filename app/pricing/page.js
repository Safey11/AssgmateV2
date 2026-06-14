"use client";

import { useState } from "react";
import Link from "next/link";
import { useUploadThing } from "@/lib/uploadthing";

const PLANS = [
  {
    name: "Free",
    price: "0",
    desc: "Perfect to get started",
    features: [
      "5 assignments per month",
      "Word & PDF export",
      "Basic AI model",
      "History (last 5)",
    ],
    cta: "Get Started",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "500",
    desc: "For serious students",
    features: [
      "Unlimited assignments",
      "All formats (Word, PDF, Excel, PPT)",
      "Faster AI model",
      "Full history",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    href: "#how-to-pay",
    highlighted: true,
  },
];

export default function PricingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const { startUpload } = useUploadThing("receiptUploader");

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    setReceipt(file);
    setReceiptPreview(URL.createObjectURL(file));
    setError(null);
  }

  async function handlePaymentSubmit() {
    if (!receipt) return setError("Please upload your JazzCash receipt");
    setSubmitting(true);
    setUploading(true);
    setError(null);
    try {
      const uploaded = await startUpload([receipt]);
      if (!uploaded || !uploaded[0]) throw new Error("Upload failed");
      const receiptUrl = uploaded[0].url;
      setUploading(false);

      const res = await fetch("/api/payment/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptUrl, amount: "500" }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError("Please login first to submit payment");
          return;
        }
        return setError(data.error);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/10 relative">
        <span className="text-xl font-bold tracking-tight">Assign<span className="text-violet-400">Mate</span></span>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/" className="text-sm text-white/60 hover:text-white transition">Home</Link>
          <Link href="/login" className="text-sm bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition">Login</Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>

        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#111] border-b border-white/10 flex flex-col px-6 py-4 gap-4 md:hidden z-50">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm text-white/60 hover:text-white transition">Home</Link>
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm bg-violet-600 px-4 py-2 rounded-lg transition text-center">Login</Link>
          </div>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16">

        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-3xl md:text-4xl font-extrabold">Simple Pricing</h1>
          <p className="text-white/40 mt-3">No hidden fees. No credit card required.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 md:mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 md:p-8 border transition flex flex-col ${
                plan.highlighted
                  ? "bg-violet-600/10 border-violet-500/40"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {plan.highlighted && (
                <span className="text-xs bg-violet-500 text-white px-3 py-1 rounded-full self-start mb-4">
                  Most Popular
                </span>
              )}
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <p className="text-white/40 text-sm mt-1">{plan.desc}</p>

              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold">Rs {plan.price}</span>
                <span className="text-white/40 text-sm">/month</span>
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-violet-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              
               <a href={plan.href}
                className={`w-full text-center py-3 rounded-xl font-semibold transition ${
                  plan.highlighted
                    ? "bg-violet-600 hover:bg-violet-500 text-white"
                    : "bg-white/5 border border-white/10 hover:border-white/30 text-white"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* How to Pay */}
        <div id="how-to-pay" className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-8 mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2">How to Upgrade 🚀</h2>
          <p className="text-white/40 text-sm mb-8">3 simple steps — takes less than 2 minutes</p>

          <div className="flex flex-col gap-8">
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base md:text-lg">Send Rs 500 via JazzCash</p>
                <p className="text-white/40 text-sm mt-1 mb-4">Send payment to this number:</p>
                <div className="bg-[#0a0a0a] border border-violet-500/30 rounded-xl px-4 md:px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-xs mb-1">JazzCash Number</p>
                    <p className="font-mono text-lg md:text-xl font-bold text-violet-400">0309-2583515</p>
                  </div>
                  <span className="text-3xl">📱</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5" />

            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <div className="min-w-0">
                <p className="font-semibold text-base md:text-lg">Take a screenshot of the receipt</p>
                <p className="text-white/40 text-sm mt-1">Take a screenshot of your JazzCash payment confirmation screen.</p>
              </div>
            </div>

            <div className="border-t border-white/5" />

            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold shrink-0">3</div>
              <div className="flex-1">
                <p className="font-semibold text-base md:text-lg">Upload receipt below</p>
                <p className="text-white/40 text-sm mt-1">Upload your receipt and we'll upgrade your account within minutes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* I've Paid Section */}
        <div className="bg-violet-600/10 border border-violet-500/20 rounded-2xl p-5 md:p-8 mb-6">
          {submitted ? (
            <div className="text-center py-4">
              <span className="text-5xl">✅</span>
              <h2 className="text-xl font-bold mt-4 mb-2">Receipt Submitted!</h2>
              <p className="text-white/40 text-sm">We've received your payment receipt. Your account will be upgraded within minutes after verification.</p>
              <p className="text-violet-400 text-sm mt-3">We'll notify you on WhatsApp once upgraded.</p>
            </div>
          ) : showPayForm ? (
            <div>
              <h2 className="text-xl font-bold mb-2">Upload Payment Receipt 🧾</h2>
              <p className="text-white/40 text-sm mb-6">Upload a screenshot of your JazzCash payment confirmation.</p>

              <div className="flex flex-col gap-4">
                {/* Upload Area */}
                <div
                  onClick={() => document.getElementById("receipt-input").click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                    receiptPreview
                      ? "border-violet-500/40"
                      : "border-white/10 hover:border-violet-500/40"
                  }`}
                >
                  {receiptPreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="max-h-48 rounded-xl object-contain"
                      />
                      <p className="text-white/40 text-xs">Click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-white/40">
                      <span className="text-4xl">📸</span>
                      <p className="text-sm">Click to upload receipt</p>
                      <p className="text-xs">PNG, JPG up to 4MB</p>
                    </div>
                  )}
                </div>

                <input
                  id="receipt-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                    {error}
                    {error.includes("login") && (
                      <Link href="/login" className="ml-2 underline text-violet-400">Login →</Link>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={submitting || !receipt}
                    className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 py-3 rounded-xl font-semibold transition"
                  >
                    {uploading ? "Uploading receipt..." : submitting ? "Submitting..." : "Submit Receipt"}
                  </button>
                  <button
                    onClick={() => { setShowPayForm(false); setError(null); setReceipt(null); setReceiptPreview(null); }}
                    className="px-4 py-3 rounded-xl border border-white/10 hover:border-white/30 transition text-white/60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Already paid? 💸</h2>
                <p className="text-white/40 text-sm">Upload your JazzCash receipt and get upgraded within minutes.</p>
              </div>
              <button
                onClick={() => setShowPayForm(true)}
                className="w-full md:w-auto bg-violet-600 hover:bg-violet-500 px-8 py-3 rounded-xl font-semibold transition shrink-0"
              >
                ✅ I've Paid
              </button>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 text-center">
          <p className="text-white/60 text-sm mb-3">Need help? Contact us directly</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm">
            <a href="mailto:safeysafo@gmail.com" className="text-violet-400 hover:underline">
              📧 safeysafo@gmail.com
            </a>
            <a href="https://wa.me/923092583515" target="_blank" className="text-violet-400 hover:underline">
              💬 WhatsApp
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}