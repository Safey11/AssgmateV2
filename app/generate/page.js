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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfName, setPdfName] = useState(null);
  const [user, setUser] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/user/me").then((r) => r.json()).then(setUser);
  }, []);

  const isFreePlan = user?.plan === "free";
  const generationsLeft = isFreePlan ? FREE_LIMIT - (user?.generationsUsed || 0) : null;

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
        body: JSON.stringify({ question, format, title }),
      });

      if (res.status === 403) {
        const data = await res.json();
        setError(data.error);
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

      // Refresh user data after generation
      fetch("/api/user/me").then((r) => r.json()).then(setUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">Assign<span className="text-violet-400">Mate</span></span>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition">Dashboard</Link>
          <Link href="/history" className="text-sm text-white/60 hover:text-white transition">History</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Generate Assignment ✨</h1>
            <p className="text-white/40 mt-2">Paste your question, pick a format, download your file.</p>
          </div>

          {/* Generations Counter */}
          {user && (
            <div className={`text-right shrink-0 px-4 py-3 rounded-xl border ${
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
                  <p className="text-white/40 text-xs">of {FREE_LIMIT} free</p>
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

          {/* Question */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-white/60">Assignment Question</label>
              <button
                onClick={() => fileRef.current.click()}
                disabled={uploadingPdf}
                className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 hover:border-violet-500/40 px-3 py-1.5 rounded-lg transition text-white/50 hover:text-white"
              >
                📎 {uploadingPdf ? "Reading PDF..." : pdfName ? pdfName : "Upload PDF"}
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
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition ${
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
              {error.includes("upgrade") && (
                <Link href="/pricing" className="ml-2 underline text-violet-400">
                  Upgrade to Pro →
                </Link>
              )}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !question.trim() || (isFreePlan && generationsLeft <= 0)}
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