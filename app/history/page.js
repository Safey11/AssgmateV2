"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const FORMAT_ICONS = {
  word: "📝",
  pdf: "📄",
  excel: "📊",
  pptx: "📽️",
};

const FORMATS = ["word", "pdf", "excel", "pptx"];

export default function HistoryPage() {
  const [assignments, setAssignments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterFormat, setFilterFormat] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    let result = [...assignments];
    if (search) result = result.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()) || a.question.toLowerCase().includes(search.toLowerCase()));
    if (filterFormat !== "all") result = result.filter((a) => a.format === filterFormat);
    if (sortOrder === "newest") result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    setFiltered(result);
  }, [search, filterFormat, sortOrder, assignments]);

  async function fetchHistory() {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setAssignments(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(id, format) {
    setDownloading(true);
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assignment.${format === "word" ? "docx" : format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  }

  async function handleRegenerate(id) {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/history/${id}/regenerate`, { method: "POST" });
      const data = await res.json();
      setSelected((prev) => ({ ...prev, content: data.content }));
      setEditedContent(data.content);
      setAssignments((prev) => prev.map((a) => a._id === id ? { ...a, content: data.content } : a));
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  }

  async function handleDelete(id) {
    try {
      await fetch(`/api/history/${id}`, { method: "DELETE" });
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      setSelected(null);
      setEditing(false);
      setEditingQuestion(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveEdit() {
    setSaving(true);
    try {
      await fetch(`/api/history/${selected._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent }),
      });
      setSelected((prev) => ({ ...prev, content: editedContent }));
      setAssignments((prev) =>
        prev.map((a) => a._id === selected._id ? { ...a, content: editedContent } : a)
      );
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveQuestion() {
    setSaving(true);
    try {
      await fetch(`/api/history/${selected._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: editedQuestion }),
      });
      setSelected((prev) => ({ ...prev, question: editedQuestion }));
      setAssignments((prev) =>
        prev.map((a) => a._id === selected._id ? { ...a, question: editedQuestion } : a)
      );
      setEditingQuestion(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(selected.content);
  }

  function openSelected(a) {
    setSelected(a);
    setSelectedFormat(a.format);
    setEditedContent(a.content);
    setEditedQuestion(a.question);
    setEditing(false);
    setEditingQuestion(false);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">Assign<span className="text-violet-400">Mate</span></span>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition">Dashboard</Link>
          <Link href="/generate" className="text-sm bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition">Generate</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">History 🕐</h1>
          <p className="text-white/40 mt-2">All your previously generated assignments.</p>
        </div>

        {/* Search + Filter + Sort */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition placeholder:text-white/20"
          />
          <select
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition text-white [&>option]:bg-[#111] [&>option]:text-white"
          >
            <option value="all">All Formats</option>
            {FORMATS.map((f) => (
              <option key={f} value={f}>{f.toUpperCase()}</option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition text-white [&>option]:bg-[#111] [&>option]:text-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto">

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selected.title}</h2>
                  <p className="text-white/40 text-sm mt-1">{new Date(selected.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => { setSelected(null); setEditing(false); setEditingQuestion(false); }}
                  className="text-white/40 hover:text-white text-2xl transition"
                >✕</button>
              </div>

              {/* Question */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-violet-400 uppercase tracking-wider">Question</p>
                  <button
                    onClick={() => setEditingQuestion(!editingQuestion)}
                    className="text-xs text-white/40 hover:text-violet-400 transition"
                  >
                    {editingQuestion ? "Cancel" : "✏️ Edit"}
                  </button>
                </div>
                {editingQuestion ? (
                  <>
                    <textarea
                      value={editedQuestion}
                      onChange={(e) => setEditedQuestion(e.target.value)}
                      rows={4}
                      className="w-full bg-white/5 border border-violet-500/40 rounded-xl p-4 text-sm text-white/70 outline-none resize-none font-sans"
                    />
                    <button
                      onClick={handleSaveQuestion}
                      disabled={saving}
                      className="mt-3 w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 py-2 rounded-xl text-sm font-semibold transition"
                    >
                      {saving ? "Saving..." : "💾 Save Question"}
                    </button>
                  </>
                ) : (
                  <p className="text-white/70 text-sm bg-white/5 rounded-xl p-4">{selected.question}</p>
                )}
              </div>

              {/* Content */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-violet-400 uppercase tracking-wider">Generated Content</p>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="text-xs text-white/40 hover:text-violet-400 transition"
                  >
                    {editing ? "Cancel Edit" : "✏️ Edit"}
                  </button>
                </div>
                {editing ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={10}
                    className="w-full bg-white/5 border border-violet-500/40 rounded-xl p-4 text-sm text-white/70 outline-none resize-none font-sans"
                  />
                ) : (
                  <pre className="text-white/70 text-sm bg-white/5 rounded-xl p-4 whitespace-pre-wrap font-sans max-h-60 overflow-y-auto">
                    {regenerating ? "Regenerating..." : selected.content}
                  </pre>
                )}
                {editing && (
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="mt-3 w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 py-2 rounded-xl text-sm font-semibold transition"
                  >
                    {saving ? "Saving..." : "💾 Save Changes"}
                  </button>
                )}
              </div>

              {/* Change Format */}
              <div className="mb-6">
                <p className="text-xs text-violet-400 uppercase tracking-wider mb-3">Download As</p>
                <div className="grid grid-cols-4 gap-2">
                  {FORMATS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFormat(f)}
                      className={`py-2 rounded-xl text-sm border transition ${(selectedFormat || selected.format) === f
                        ? "border-violet-500 bg-violet-500/10 text-white"
                        : "border-white/10 bg-white/5 text-white/50 hover:border-white/30"
                        }`}
                    >
                      {FORMAT_ICONS[f]} {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDownload(selected._id, selectedFormat || selected.format)}
                  disabled={downloading}
                  className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 py-3 rounded-xl text-sm font-semibold transition"
                >
                  {downloading ? "Downloading..." : "⬇️ Download"}
                </button>
                <button
                  onClick={() => handleRegenerate(selected._id)}
                  disabled={regenerating}
                  className="bg-white/5 border border-white/10 hover:border-violet-500/40 disabled:opacity-40 py-3 rounded-xl text-sm font-semibold transition"
                >
                  {regenerating ? "Regenerating..." : "🔄 Regenerate"}
                </button>
                <button
                  onClick={handleCopy}
                  className="bg-white/5 border border-white/10 hover:border-white/30 py-3 rounded-xl text-sm font-semibold transition"
                >
                  📋 Copy Text
                </button>
                <button
                  onClick={() => handleDelete(selected._id)}
                  className="bg-red-500/10 border border-red-500/20 hover:border-red-500/50 text-red-400 py-3 rounded-xl text-sm font-semibold transition"
                >
                  🗑️ Delete
                </button>
              </div>

            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-white/5 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <span className="text-5xl mb-4">📭</span>
            <p className="text-sm">No assignments found.</p>
            <Link href="/generate" className="mt-4 text-violet-400 text-sm hover:underline">
              Generate your first one →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((a) => (
              <div
                key={a._id}
                onClick={() => openSelected(a)}
                className="bg-white/5 border border-white/10 hover:border-violet-500/40 rounded-2xl p-6 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{FORMAT_ICONS[a.format]}</span>
                    <div>
                      <h3 className="font-semibold">{a.title}</h3>
                      <p className="text-white/40 text-sm mt-1 line-clamp-1">{a.question}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-1 rounded-full">
                      {a.format.toUpperCase()}
                    </span>
                    <p className="text-white/30 text-xs mt-2">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}