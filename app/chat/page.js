"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

const FORMATS = [
  { id: "word", label: "Word", icon: "📝", ext: "docx" },
  { id: "pdf", label: "PDF", icon: "📄", ext: "pdf" },
  { id: "excel", label: "Excel", icon: "📊", ext: "xlsx" },
  { id: "pptx", label: "PowerPoint", icon: "📽️", ext: "pptx" },
];

const QUICK_ACTIONS = [
  { label: "Make it longer", icon: "📏" },
  { label: "Add examples", icon: "💡" },
  { label: "Simplify it", icon: "✂️" },
  { label: "Add diagrams", icon: "📊" },
  { label: "Add references", icon: "📚" },
  { label: "Make it shorter", icon: "🔍" },
];

const EXAMPLE_PROMPTS = [
  "Write my OOP assignment on inheritance and polymorphism with Python code examples",
  "Complete my business ethics essay on corporate social responsibility",
  "Explain data structures — arrays, stacks, queues with diagrams and code",
  "Write an Islamic Studies assignment on the five pillars of Islam",
];

// Simple markdown renderer
function MarkdownContent({ content }) {
  const lines = content.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip think tags
    if (line.includes("<think>") || line.includes("</think>") || line.includes("[Proceeds]")) {
      i++;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={`line-${i}-${elements.length}`} className="text-xl font-bold text-white mt-5 mb-2">
          {line.replace("# ", "")}
        </h1>
      );
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`line-${i}-${elements.length}`} className="text-lg font-semibold text-white/90 mt-4 mb-2">
          {line.replace("## ", "")}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`line-${i}-${elements.length}`} className="text-base font-semibold text-white/80 mt-3 mb-1">
          {line.replace("### ", "")}
        </h3>
      );
      i++;
      continue;
    }

    // Code block
    if (line.startsWith("```")) {
      const lang = line.replace("```", "").trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={`line-${i}-${elements.length}`} className="my-3 rounded-xl overflow-hidden border border-white/10">
          {lang && (
            <div className="px-4 py-1.5 bg-white/5 text-xs text-white/40 border-b border-white/10">
              {lang}
            </div>
          )}
          <pre className="bg-[#0d0d0d] px-4 py-3 text-xs text-green-300 overflow-x-auto leading-relaxed">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        listItems.push(lines[i].replace(/^[-*] /, ""));
        i++;
      }
      elements.push(
        <ul key={`line-${i}-${elements.length}`} className="my-2 space-y-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-white/75">
              <span className="text-violet-400 mt-1 shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\. /.test(line)) {
      const listItems = [];
      let num = 1;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\. /, ""));
        i++;
        num++;
      }
      elements.push(
        <ol key={`line-${i}-${elements.length}`} className="my-2 space-y-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-white/75">
              <span className="text-violet-400 shrink-0 font-mono text-xs mt-0.5">{idx + 1}.</span>
              <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`line-${i}-${elements.length}`} className="h-2" />);
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={`line-${i}-${elements.length}`} className="text-sm text-white/75 leading-relaxed my-1"
        dangerouslySetInnerHTML={{ __html: renderInline(line) }}
      />
    );
    i++;
  }

  return <div className="py-1">{elements}</div>;
}

function renderInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-white/80 italic">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-white/10 text-green-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState("word");
  const [wordCount, setWordCount] = useState("medium");
  const [citationStyle, setCitationStyle] = useState("APA");
  const [language, setLanguage] = useState("english");
  const [showSettings, setShowSettings] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const isFirstMessage = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text) {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage = { role: "user", content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          format,
          subject: "general",
          wordCount,
          citationStyle,
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: data.error || "Something went wrong. Please try again.",
          isError: true,
        }]);
        return;
      }

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.content,
        canDownload: true,
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Something went wrong. Please try again.",
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(content, msgIndex) {
    setDownloading(msgIndex);
    try {
      const res = await fetch("/api/generate-from-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, format, title: "Assignment" }),
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const selectedFormat = FORMATS.find((f) => f.id === format);
      a.download = `assignment.${selectedFormat?.ext || format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <main className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0 relative">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Assign<span className="text-violet-400">Mate</span>
          </Link>
          <span className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">Chat</span>
        </div>

        <div className="hidden md:flex items-center gap-5">
          <Link href="/generate" className="text-sm text-white/40 hover:text-white transition">⚡ Quick Generate</Link>
          <Link href="/history" className="text-sm text-white/40 hover:text-white transition">History</Link>
          <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition">Dashboard</Link>
          <button
            onClick={async () => { await signOut({ redirect: false }); window.location.href = "/login"; }}
            className="text-sm text-white/40 hover:text-white transition"
          >
            Logout
          </button>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
          <span className={`block w-5 h-0.5 bg-white/60 mb-1 transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white/60 mb-1 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white/60 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>

        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#111] border-b border-white/10 flex flex-col px-6 py-4 gap-4 md:hidden z-50">
            <Link href="/generate" onClick={() => setMenuOpen(false)} className="text-sm text-white/60">⚡ Quick Generate</Link>
            <Link href="/history" onClick={() => setMenuOpen(false)} className="text-sm text-white/60">History</Link>
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm text-white/60">Dashboard</Link>
          </div>
        )}
      </nav>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isFirstMessage ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center text-3xl mb-6">
              ✨
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3">What's your assignment?</h1>
            <p className="text-white/35 text-sm max-w-sm mb-10">
              Tell me what you need. I'll write it, and you can refine it until it's perfect.
            </p>

            {/* Example prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example}
                  onClick={() => handleSend(example)}
                  className="text-left text-xs text-white/40 hover:text-white/70 bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/15 rounded-xl px-4 py-3 transition leading-relaxed"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

                {/* Avatar */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold mt-1 ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 border border-white/10 text-white"
                }`}>
                  {msg.role === "user" ? "U" : "✨"}
                </div>

                {/* Content */}
                <div className={`flex flex-col gap-3 ${msg.role === "user" ? "items-end max-w-[80%]" : "items-start max-w-[92%]"}`}>

                  {msg.role === "user" ? (
                    <div className="bg-violet-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  ) : msg.isError ? (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="bg-white/4 border border-white/8 rounded-2xl rounded-tl-sm px-5 py-4">
                      <MarkdownContent content={msg.content} />
                    </div>
                  )}

                  {/* Download + Format selector */}
                  {msg.canDownload && (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-xl p-1">
                        {FORMATS.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setFormat(f.id)}
                            className={`text-xs px-2.5 py-1.5 rounded-lg transition ${
                              format === f.id
                                ? "bg-violet-600 text-white"
                                : "text-white/35 hover:text-white"
                            }`}
                          >
                            {f.icon} {f.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleDownload(msg.content, index)}
                        disabled={downloading === index}
                        className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white px-3 py-2 rounded-xl transition font-medium"
                      >
                        {downloading === index ? "Saving..." : "⬇️ Download"}
                      </button>
                    </div>
                  )}

                  {/* Quick actions */}
                  {msg.canDownload && (
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => handleSend(action.label)}
                          disabled={loading}
                          className="text-xs text-white/35 hover:text-white/70 bg-white/3 hover:bg-white/8 border border-white/8 hover:border-white/20 px-3 py-1.5 rounded-full transition"
                        >
                          {action.icon} {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs mt-1">✨</div>
                <div className="bg-white/4 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-5">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-white/5">
        <div className="max-w-3xl mx-auto">

          {/* Settings panel */}
          {showSettings && (
            <div className="mb-3 p-3 bg-white/3 border border-white/8 rounded-2xl flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/30 mr-1">Lang:</span>
                {[{ id: "english", label: "🇬🇧 EN" }, { id: "urdu", label: "🇵🇰 UR" }].map((l) => (
                  <button key={l.id} onClick={() => setLanguage(l.id)}
                    className={`text-xs px-2 py-1 rounded-lg transition ${language === l.id ? "bg-violet-600 text-white" : "text-white/40 hover:text-white bg-white/5"}`}>
                    {l.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/30 mr-1">Refs:</span>
                {["none", "APA", "Harvard"].map((c) => (
                  <button key={c} onClick={() => setCitationStyle(c)}
                    className={`text-xs px-2 py-1 rounded-lg transition ${citationStyle === c ? "bg-violet-600 text-white" : "text-white/40 hover:text-white bg-white/5"}`}>
                    {c === "none" ? "None" : c}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/30 mr-1">Length:</span>
                {["short", "medium", "long", "detailed"].map((w) => (
                  <button key={w} onClick={() => setWordCount(w)}
                    className={`text-xs px-2 py-1 rounded-lg capitalize transition ${wordCount === w ? "bg-violet-600 text-white" : "text-white/40 hover:text-white bg-white/5"}`}>
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input box */}
          <div className="flex gap-2 items-end bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-violet-500/30 transition">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`shrink-0 p-1 rounded-lg transition mb-0.5 text-base ${showSettings ? "text-violet-400" : "text-white/20 hover:text-white/60"}`}
              title="Settings"
            >
              ⚙️
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={isFirstMessage
                ? "What's your assignment? Describe it or paste your question..."
                : "Ask to refine, extend, or change anything..."}
              rows={1}
              className="flex-1 bg-transparent text-sm outline-none resize-none text-white placeholder:text-white/20 max-h-28 leading-relaxed"
            />

            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="shrink-0 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-xl transition mb-0.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          <p className="text-white/15 text-xs text-center mt-2">
            Always review before submitting to your teacher.
          </p>
        </div>
      </div>

    </main>
  );
}