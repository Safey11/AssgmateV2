import Link from "next/link";

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: June 2025</p>

        <div className="flex flex-col gap-10 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Who We Are</h2>
            <p>AssignMate is an AI-powered assignment generation tool built for students. We are based in Pakistan and our service is available at assgmate-v2.vercel.app. If you have any questions, contact us at safeysafo@gmail.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. What Data We Collect</h2>
            <p>We collect the following information when you register and use AssignMate:</p>
            <ul className="list-none flex flex-col gap-2 mt-3">
              {[
                "Your name and email address when you register",
                "Your assignment questions and generated content",
                "Your account plan (Free or Pro)",
                "Number of assignments generated",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-violet-400 mt-1">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Data</h2>
            <p>We use your data only to provide and improve the AssignMate service:</p>
            <ul className="list-none flex flex-col gap-2 mt-3">
              {[
                "To create and manage your account",
                "To generate assignments based on your questions",
                "To track your usage and enforce plan limits",
                "To send important account-related emails",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-violet-400 mt-1">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. We Never Sell Your Data</h2>
            <p>We do not sell, trade, or share your personal information with any third parties for marketing purposes. Your data belongs to you.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Storage</h2>
            <p>Your data is stored securely on MongoDB Atlas cloud servers. We use industry standard security practices to protect your information.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-none flex flex-col gap-2 mt-3">
              {[
                "Request a copy of your data",
                "Request deletion of your account and data",
                "Update your personal information",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-violet-400 mt-1">→</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">To exercise these rights contact us at safeysafo@gmail.com</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Cookies</h2>
            <p>We use cookies only for authentication purposes — to keep you logged in. We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Contact</h2>
            <p>If you have any questions about this privacy policy contact us at:</p>
            <p className="mt-2 text-violet-400">safeysafo@gmail.com</p>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-6 text-center text-white/30 text-sm">
        <div className="flex items-center justify-center gap-6">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
        </div>
        <p className="mt-3">© 2025 AssignMate. Built for students, by a student.</p>
      </footer>

    </main>
  );
}