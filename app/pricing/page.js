import Link from "next/link";

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
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">Assign<span className="text-violet-400">Mate</span></span>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-white/60 hover:text-white transition">Home</Link>
          <Link href="/login" className="text-sm bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition">Login</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold">Simple Pricing</h1>
          <p className="text-white/40 mt-3">No hidden fees. No credit card required.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border transition flex flex-col ${
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
        <div id="how-to-pay" className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-2">How to Upgrade 🚀</h2>
          <p className="text-white/40 text-sm mb-8">3 simple steps — takes less than 2 minutes</p>

          <div className="flex flex-col gap-8">

            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <div className="flex-1">
                <p className="font-semibold text-lg">Send Rs 500 via JazzCash</p>
                <p className="text-white/40 text-sm mt-1 mb-4">Send payment to this number:</p>
                <div className="bg-[#0a0a0a] border border-violet-500/30 rounded-xl px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-xs mb-1">JazzCash Number</p>
                    <p className="font-mono text-xl font-bold text-violet-400">0309-2583515</p>
                  </div>
                  <span className="text-3xl">📱</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <div>
                <p className="font-semibold text-lg">Add your email in the message</p>
                <p className="text-white/40 text-sm mt-1">When sending the payment, write your AssignMate account email in the description field.</p>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 mt-3 text-sm text-white/50 font-mono">
                  e.g. "yourname@gmail.com — AssignMate Pro"
                </div>
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold shrink-0">3</div>
              <div>
                <p className="font-semibold text-lg">Get upgraded within 24 hours</p>
                <p className="text-white/40 text-sm mt-1">Once we confirm your payment your account will be upgraded to Pro automatically. You'll get unlimited generations right away.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Contact */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-white/60 text-sm mb-3">Need help? Contact us directly</p>
          <div className="flex items-center justify-center gap-6 text-sm">
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