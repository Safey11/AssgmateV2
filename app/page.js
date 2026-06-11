import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">Assign<span className="text-violet-400">Mate</span></span>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-sm text-white/60 hover:text-white transition">About</Link>
          <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition">Pricing</Link>
          <Link href="/login" className="text-sm bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition">Login</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-16">
        <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full mb-6">
          🎓 Built for students like you
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight max-w-3xl">
          Stop wasting hours on <span className="text-violet-400">assignments</span>
        </h1>
        <p className="mt-6 text-lg text-white/50 max-w-xl">
          Paste your question, pick your format — get a ready to submit Word, PDF, Excel or PowerPoint file in seconds.
        </p>
        <div className="flex gap-4 mt-10">
          <Link href="/register" className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-semibold transition">
            Get Started Free
          </Link>
          <Link href="/pricing" className="border border-white/10 hover:border-white/30 px-6 py-3 rounded-xl text-white/60 hover:text-white transition">
            See Pricing
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12 text-white/80">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Paste your question", desc: "Type or paste your assignment question or upload a PDF." },
            { step: "02", title: "Choose your format", desc: "Pick Word, PDF, Excel, or PowerPoint — whatever your teacher wants." },
            { step: "03", title: "Download and submit", desc: "Get a fully formatted, ready to submit file in seconds." },
          ].map((item) => (
            <div key={item.step} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-violet-500/40 transition">
              <span className="text-violet-400 text-sm font-mono">{item.step}</span>
              <h3 className="text-lg font-semibold mt-2 mb-2">{item.title}</h3>
              <p className="text-white/50 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Formats */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12 text-white/80">Supported formats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "📝", label: "Word", ext: ".docx" },
            { icon: "📊", label: "Excel", ext: ".xlsx" },
            { icon: "📽️", label: "PowerPoint", ext: ".pptx" },
            { icon: "📄", label: "PDF", ext: ".pdf" },
          ].map((f) => (
            <div key={f.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-2 hover:border-violet-500/40 transition">
              <span className="text-3xl">{f.icon}</span>
              <span className="font-semibold">{f.label}</span>
              <span className="text-white/40 text-xs">{f.ext}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="bg-violet-600/10 border border-violet-500/20 rounded-3xl p-12 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to save hours?</h2>
          <p className="text-white/50 mb-8">Join students from universities across Pakistan.</p>
          <Link href="/register" className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-semibold transition">
            Start for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-6 text-center text-white/30 text-sm">
        <div className="flex items-center justify-center gap-6 mb-3">
          <Link href="/about" className="hover:text-white transition">About</Link>
          <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
        </div>
        <p>© 2025 AssignMate. Built for students, by a student.</p>
      </footer>

    </main>
  );
}