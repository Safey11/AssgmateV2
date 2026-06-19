"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const FORMATS = [
  { id: "word", label: "Word", icon: "📝", ext: ".docx" },
  { id: "pdf", label: "PDF", icon: "📄", ext: ".pdf" },
  { id: "excel", label: "Excel", icon: "📊", ext: ".xlsx" },
  { id: "pptx", label: "PowerPoint", icon: "📽️", ext: ".pptx" },
];

const FREE_LIMIT = 5;

export default function GeneratePage() {
  const [question, setQuestion] = useState("");
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("word");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfName, setPdfName] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((session) => {
        if (session?.user) {
          setIsLoggedIn(true);
          fetch("/api/user/me").then((r) => r.json()).then(setUser);
        } else {
          setIsLoggedIn(false);
        }
      });
  }, []);

  const isFreePlan = user?.plan === "free";
  const totalAllowed = FREE_LIMIT + (user?.bonusGenerations || 0);
  const generationsLeft = isFreePlan ? totalAllowed - (user?.generationsUsed || 0) : null;

  async function handlePdfUpload(e) {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return;
    setPdfName(file.name);
    setUploadingPdf(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse PDF");
      setQuestion(data.text);
    } catch (err) {
      setError(err.message);
      setPdfName(null);
    } finally {
      setUploadingPdf(false);
    }
  }

  async function handleGenerate() {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, format, title, dueDate: dueDate || null }),
      });

      if (res.status === 403) {
        const data = await res.json();
        if (!isLoggedIn) {
          setShowSignupPrompt(true);
        } else {
          setError(data.error);
        }
        return;
      }

      if (!res.ok) throw new Error("Generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "assignment"}.${format === "word" ? "docx" : format}`;
      a.click();
      window.URL.revokeObjectURL(url);

      if (isLoggedIn) {
        fetch("/api/user/me").then((r) => r.json()).then(setUser);
      } else {
        setShowSignupPrompt(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/10 relative">
        <Link href="/" className="text-xl font-bold tracking-tight">Assign<span className="text-violet-400">Mate</span></Link>

        <div className="hidden md:flex items-center gap-6">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition">Dashboard</Link>
              <Link href="/history" className="text-sm text-white/60 hover:text-white transition">History</Link>
            </>
          ) : (
            <>
              <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition">Pricing</Link>
              <Link href="/login" className="text-sm bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition">Login</Link>
            </>
          )}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>

        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#111] border-b border-white/10 flex flex-col px-6 py-4 gap-4 md:hidden z-50">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm text-white/60 hover:text-white transition">Dashboard</Link>
                <Link href="/history" onClick={() => setMenuOpen(false)} className="text-sm text-white/60 hover:text-white transition">History</Link>
              </>
            ) : (
              <>
                <Link href="/pricing" onClick={() => setMenuOpen(false)} className="text-sm text-white/60 hover:text-white transition">Pricing</Link>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm bg-violet-600 px-4 py-2 rounded-lg transition text-center">Login</Link>
              </>
            )}
          </div>
        )}
      </nav>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* Signup Prompt Modal */}
        {showSignupPrompt && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-[#111] border border-violet-500/30 rounded-2xl p-8 max-w-md w-full text-center">
              <span className="text-5xl">🎉</span>
              <h2 className="text-2xl font-bold mt-4 mb-2">Loved it?</h2>
              <p className="text-white/50 mb-6">
                Create a free account to unlock 5 free generations every month, save your history, and access all formats.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/register" className="bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-semibold transition">
                  Create Free Account
                </Link>
                <button
                  onClick={() => setShowSignupPrompt(false)}
                  className="text-white/40 text-sm hover:text-white transition"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header + Counter */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Generate Assignment ✨</h1>
            <p className="text-white/40 mt-2 text-sm">
              {isLoggedIn === false
                ? "Try it free — no account needed for your first generation."
                : "Paste your question, pick a format, download your file."}
            </p>
          </div>

          {/* Generations Counter */}
          {isLoggedIn && user && (
            <div className={`shrink-0 px-4 py-3 rounded-xl border ${
              isFreePlan && generationsLeft <= 1
                ? "bg-red-500/10 border-red-500/20"
                : isFreePlan
                ? "bg-white/5 border-white/10"
                : "bg-violet-500/10 border-violet-500/20"
            }`}>
              {isFreePlan ? (
                <>
                  <p className={`text-lg font-bold ${generationsLeft <= 1 ? "text-red-400" : "text-white"}`}>
                    {generationsLeft} left
                  </p>
                  <p className="text-white/40 text-xs">of {totalAllowed} free</p>
                  {generationsLeft <= 1 && (
                    <Link href="/pricing" className="text-xs text-violet-400 hover:underline mt-1 block">
                      Upgrade →
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-violet-400">∞</p>
                  <p className="text-white/40 text-xs">Pro Plan</p>
                </>
              )}
            </div>
          )}

          {/* Anonymous badge */}
          {isLoggedIn === false && (
            <div className="shrink-0 px-4 py-3 rounded-xl border bg-violet-500/10 border-violet-500/20">
              <p className="text-sm font-semibold text-violet-400">🎁 1 Free Try</p>
              <p className="text-white/40 text-xs">No account needed</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">

          {/* Title */}
          <div>
            <label className="text-sm text-white/60 mb-2 block">Assignment Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Data Structures Assignment 1"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20"
            />
          </div>

          {/* Due Date - only for logged in users */}
          {isLoggedIn && (
            <div>
              <label className="text-sm text-white/60 mb-2 block">
                Due Date <span className="text-white/30">(optional — we'll remind you 1 day before)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition text-white/70"
              />
            </div>
          )}

          {/* Question */}
          <div>
            <div className="flex items-center justify-between mb-2 gap-2">
              <label className="text-sm text-white/60">Assignment Question</label>
              <button
                onClick={() => fileRef.current.click()}
                disabled={uploadingPdf}
                className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 hover:border-violet-500/40 px-3 py-1.5 rounded-lg transition text-white/50 hover:text-white shrink-0"
              >
                📎 {uploadingPdf ? "Reading..." : pdfName ? pdfName.slice(0, 10) + "..." : "Upload PDF"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
            </div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Paste your assignment question here or upload a PDF above..."
              rows={8}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20 resize-none"
            />
          </div>

          {/* Format */}
          <div>
            <label className="text-sm text-white/60 mb-3 block">Output Format</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border transition ${
                    format === f.id
                      ? "border-violet-500 bg-violet-500/10 text-white"
                      : "border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <span className="text-2xl">{f.icon}</span>
                  <span className="text-sm font-medium">{f.label}</span>
                  <span className="text-xs text-white/30">{f.ext}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !question.trim() || (isLoggedIn && isFreePlan && generationsLeft <= 0)}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed py-4 rounded-xl font-semibold transition text-lg"
          >
            {loading ? "Generating..." : "Generate & Download ✨"}
          </button>

          {loading && (
            <div className="text-center text-white/40 text-sm animate-pulse">
              AI is working on your assignment. This may take a few seconds...
            </div>
          )}

        </div>
      </div>
    </main>
  );
}