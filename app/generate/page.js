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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pdfName, setPdfName] = useState(null);
  const [imageName, setImageName] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [courseName, setCourseName] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const fileRef = useRef(null);
  const imageRef = useRef(null);

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
    if (!file) return;
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

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageName(file.name);
    setUploadingImage(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/parse-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze image");
      setQuestion(data.text);
    } catch (err) {
      setError(err.message);
      setImageName(null);
    } finally {
      setUploadingImage(false);
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
        body: JSON.stringify({
          question,
          format,
          title,
          dueDate: dueDate || null,
          wordCount: "medium",
          citationStyle: "APA",
          subject: "general",
          language: "english",
          studentDetails: {
            name: studentName,
            rollNumber,
            courseName,
            instructorName,
            date: new Date().toLocaleDateString("en-PK"),
          },
        }),
      });

      if (res.status === 403) {
        const data = await res.json();
        if (!isLoggedIn) setShowSignupPrompt(true);
        else setError(data.error);
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
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 relative">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Assign<span className="text-violet-400">Mate</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/chat" className="text-sm bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition">
            ✨ Chat Mode
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/history" className="text-sm text-white/60 hover:text-white transition">History</Link>
              <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition">Dashboard</Link>
            </>
          ) : (
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition">Login</Link>
          )}
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#111] border-b border-white/10 flex flex-col px-6 py-4 gap-4 md:hidden z-50">
            <Link href="/chat" onClick={() => setMenuOpen(false)} className="text-sm bg-violet-600 px-4 py-2 rounded-lg text-center">✨ Chat Mode</Link>
            <Link href="/history" onClick={() => setMenuOpen(false)} className="text-sm text-white/60">History</Link>
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm text-white/60">Dashboard</Link>
          </div>
        )}
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Signup Prompt */}
        {showSignupPrompt && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-[#111] border border-violet-500/30 rounded-2xl p-8 max-w-md w-full text-center">
              <span className="text-5xl">🎉</span>
              <h2 className="text-2xl font-bold mt-4 mb-2">Loved it?</h2>
              <p className="text-white/50 mb-6">Create a free account to unlock 5 free generations and save your history.</p>
              <div className="flex flex-col gap-3">
                <Link href="/register" className="bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-semibold transition">
                  Create Free Account
                </Link>
                <button onClick={() => setShowSignupPrompt(false)} className="text-white/40 text-sm hover:text-white transition">
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Quick Generate ⚡</h1>
            <p className="text-white/40 text-sm mt-1">Fill in details and download instantly. For conversation try <Link href="/chat" className="text-violet-400 hover:underline">Chat Mode</Link>.</p>
          </div>
          {isLoggedIn && user && isFreePlan && (
            <div className={`shrink-0 px-3 py-2 rounded-xl border text-center ${
              generationsLeft <= 1 ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/10"
            }`}>
              <p className={`text-base font-bold ${generationsLeft <= 1 ? "text-red-400" : ""}`}>{generationsLeft}</p>
              <p className="text-white/40 text-xs">of {totalAllowed} left</p>
            </div>
          )}
          {isLoggedIn && user && !isFreePlan && (
            <div className="shrink-0 px-3 py-2 rounded-xl border bg-violet-500/10 border-violet-500/20 text-center">
              <p className="text-base font-bold text-violet-400">∞</p>
              <p className="text-white/40 text-xs">Pro</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">

          {/* Title */}
          <div>
            <label className="text-sm text-white/50 mb-1.5 block">Assignment Title <span className="text-white/20">(optional)</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Data Structures Assignment 1"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/50 transition placeholder:text-white/20"
            />
          </div>

          {/* Question */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-white/50">Assignment Question</label>
              <div className="flex gap-2">
                <button
                  onClick={() => fileRef.current.click()}
                  disabled={uploadingPdf || uploadingImage}
                  className="text-xs text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition"
                >
                  {uploadingPdf ? "Reading..." : "📄 PDF"}
                </button>
                <button
                  onClick={() => imageRef.current.click()}
                  disabled={uploadingPdf || uploadingImage}
                  className="text-xs text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition"
                >
                  {uploadingImage ? "Analyzing..." : "🖼️ Image"}
                </button>
                <input ref={fileRef} type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                <input ref={imageRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            </div>
            {(uploadingPdf || uploadingImage) && (
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-2 mb-2 text-xs text-violet-400 animate-pulse">
                {uploadingPdf ? "📄 Reading PDF..." : "🖼️ AI analyzing image..."}
              </div>
            )}
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Paste your assignment question here, or upload a PDF/image above..."
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/50 transition placeholder:text-white/20 resize-none"
            />
          </div>

          {/* Format */}
          <div>
            <label className="text-sm text-white/50 mb-1.5 block">Output Format</label>
            <div className="grid grid-cols-4 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition ${
                    format === f.id
                      ? "border-violet-500 bg-violet-500/10 text-white"
                      : "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-xs font-medium">{f.label}</span>
                  <span className="text-xs text-white/20">{f.ext}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options - collapsed by default */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition"
            >
              <span>{showAdvanced ? "▼" : "▶"}</span>
              <span>Advanced Options</span>
              <span className="text-white/20 text-xs">(student details, due date)</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 flex flex-col gap-4 p-4 bg-white/3 border border-white/8 rounded-xl">
                {/* Student Details */}
                <div>
                  <p className="text-xs text-white/40 mb-2">Student Details <span className="text-white/20">(appears on document header)</span></p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Your Name", value: studentName, set: setStudentName, placeholder: "Full name" },
                      { label: "Roll Number", value: rollNumber, set: setRollNumber, placeholder: "e.g. 2021-CS-45" },
                      { label: "Course", value: courseName, set: setCourseName, placeholder: "e.g. Data Structures" },
                      { label: "Instructor", value: instructorName, set: setInstructorName, placeholder: "e.g. Sir Ahmed" },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="text-xs text-white/30 mb-1 block">{field.label}</label>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => field.set(e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500/50 transition placeholder:text-white/15"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                {isLoggedIn && (
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Due Date <span className="text-white/20">(we'll remind you 1 day before)</span></label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none focus:border-violet-500/50 transition"
                    />
                  </div>
                )}
              </div>
            )}
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
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed py-4 rounded-xl font-semibold transition text-base"
          >
            {loading ? "Generating..." : "Generate & Download ⚡"}
          </button>

          {loading && (
            <div className="text-center text-white/30 text-xs animate-pulse">
              AI is working on your assignment...
            </div>
          )}

          {/* Switch to chat */}
          <div className="text-center">
            <p className="text-white/20 text-xs">
              Want to refine your assignment or ask follow-up questions?{" "}
              <Link href="/chat" className="text-violet-400 hover:underline">Try Chat Mode →</Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
