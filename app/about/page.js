import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Assign<span className="text-violet-400">Mate</span>
        </Link>
        <Link href="/register" className="text-sm bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition">
          Get Started
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl font-extrabold mb-4">About AssignMate</h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Built by a student, for students. AssignMate was created out of frustration with spending hours formatting assignments instead of actually learning.
          </p>
        </div>

        {/* Story */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">The Story</h2>
          <div className="flex flex-col gap-4 text-white/60 leading-relaxed">
            <p>
              I'm Saif, a Computer Science student at Shaheed Benazir Bhutto University and a full-stack developer. Like every student, I hated spending hours on assignments — not because the concepts were hard, but because formatting Word documents, making Excel sheets, and building PowerPoint slides wasted so much time.
            </p>
            <p>
              I also teach web development at WebCraft Academy, and I saw my students struggling with the same problem. So I built AssignMate — a tool that takes your assignment question and gives you a ready-to-submit file in seconds.
            </p>
            <p>
              AssignMate is not about cheating. It's about saving time on formatting so you can focus on actually understanding the material.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-violet-600/10 border border-violet-500/20 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-white/60 leading-relaxed">
            To save Pakistani students hours every week by automating the boring parts of academic work — so they can spend more time learning, not formatting.
          </p>
        </div>

        {/* Values */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">What We Stand For</h2>
          <div className="flex flex-col gap-4">
            {[
              { icon: "🔒", title: "Privacy First", desc: "We never sell your data. Your assignments are yours." },
              { icon: "💰", title: "Affordable", desc: "Rs 500/month — less than a meal. Built for Pakistani students." },
              { icon: "⚡", title: "Fast & Simple", desc: "No complicated setup. Paste, click, download. Done." },
              { icon: "🤝", title: "Honest", desc: "We show real numbers, charge fair prices, and deliver what we promise." },
            ].map((v) => (
              <div key={v.title} className="flex items-start gap-4">
                <span className="text-2xl">{v.icon}</span>
                <div>
                  <p className="font-semibold">{v.title}</p>
                  <p className="text-white/40 text-sm mt-1">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Builder */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">The Builder</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-2xl font-bold">
              
            </div>
            <div>
              <p className="font-semibold text-lg">Saif</p>
              <p className="text-white/40 text-sm">CS Student · Full Stack Developer · Teacher at WebCraft Academy</p>
              <p className="text-white/40 text-sm">Shaheed Benazir Bhutto University, Pakistan</p>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <a
              href="mailto:safeysafo@gmail.com"
              className="text-sm text-violet-400 hover:underline"
            >
              📧 safeysafo@gmail.com
            </a>
            <a
              href="https://wa.me/923092583515"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-violet-400 hover:underline"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-3">Ready to save hours?</h2>
          <p className="text-white/40 mb-6">Join students already using AssignMate.</p>
          <Link href="/register" className="bg-violet-600 hover:bg-violet-500 px-8 py-3 rounded-xl font-semibold transition">
            Get Started Free
          </Link>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-6 text-center text-white/30 text-sm">
        <div className="flex items-center justify-center gap-6">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/about" className="hover:text-white transition">About</Link>
          <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
        </div>
        <p className="mt-3">© 2025 AssignMate. Built for students, by a student.</p>
      </footer>

    </main>
  );
}