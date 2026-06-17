import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/illustrations";
import { Shield, Brain, TrendingUp, Heart, ArrowRight, Check } from "lucide-react";

const features = [
  { icon: Brain,      title: "AI Therapist Mira",  desc: "CBT-inspired, empathetic conversations available 24/7" },
  { icon: TrendingUp, title: "Mood Tracking",       desc: "Daily check-ins with beautiful trend visualizations" },
  { icon: Heart,      title: "Reflective Journal",  desc: "AI-powered insights from your personal journal entries" },
  { icon: Shield,     title: "Safe & Private",      desc: "End-to-end encrypted, HIPAA-conscious design" },
];

const plans = [
  { name: "Basic",   price: "$1",  period: "/mo", features: ["Daily mood check-in", "7-day history", "5 AI chats/month"], cta: "Get Started", popular: false },
  { name: "Plus",    price: "$5",  period: "/mo", features: ["Unlimited mood tracking", "AI chat (100/mo)", "Journal + AI reflections", "30-day insights"], cta: "Get Started", popular: true },
  { name: "Premium", price: "$10", period: "/mo", features: ["Everything in Plus", "Unlimited AI chat", "Advanced analytics", "Priority support"], cta: "Get Started", popular: false },
];

const testimonials = [
  { name: "Sarah M.", text: "Mira helped me through my anxiety in ways I didn't expect. The insights are incredibly thoughtful." },
  { name: "James K.", text: "Finally a mental health app that feels genuinely caring. The mood trends opened my eyes." },
  { name: "Priya L.", text: "The journal reflections are spot-on. It's like having a therapist in my pocket." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/60">
        <div className="page-container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-indigo-700 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Mindora</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
            <Link href="#features"     className="hover:text-slate-800 transition-colors">Features</Link>
            <Link href="#pricing"      className="hover:text-slate-800 transition-colors">Pricing</Link>
            <Link href="#testimonials" className="hover:text-slate-800 transition-colors">Reviews</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="page-container py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5 text-sm text-slate-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-soft" />
            AI-powered mental wellness
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-slate-900">
            Your mind deserves<br />
            <span className="gradient-text">daily care.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-lg">
            Meet Mira, your empathetic AI companion. Track moods, reflect through journaling, and get evidence-based support — anytime you need it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Link href="/signup">
              <Button size="lg" className="bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97] gap-2">
                Start your journey <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Not a replacement for professional therapy.{" "}
            <Link href="/safety" className="underline underline-offset-2 hover:text-slate-600">Learn more</Link>
          </p>
        </div>
        <div className="flex-1 flex justify-center">
          <HeroIllustration />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="page-container py-20">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Everything you need to thrive</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Built on evidence-based techniques with warmth at its core.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-card card-hover border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-slate-700" />
              </div>
              <h3 className="font-semibold mb-1 text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="page-container py-20">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Loved by thousands</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, text }) => (
            <div key={name} className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
              {/* cool ice-blue rating dots instead of yellow stars */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-indigo-300" />
                ))}
              </div>
              <p className="text-sm text-slate-500 mb-4">"{text}"</p>
              <p className="text-sm font-medium text-slate-700">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="page-container py-20">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Simple, transparent pricing</h2>
          <p className="text-slate-500">Start free, upgrade when you're ready.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl p-6 border-2 shadow-card relative transition-all duration-200 hover:scale-[0.985] ${
                plan.popular ? "border-indigo-400 shadow-glow" : "border-slate-100"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-4">
                <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 text-sm">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button
                  className={`w-full ${plan.popular ? "bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97]" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Safety Banner */}
      <section className="page-container py-8">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <Shield className="w-8 h-8 text-slate-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-slate-800">Mental Health Disclaimer</p>
            <p className="text-sm text-slate-500">
              Mindora is not a substitute for professional mental health treatment. If you're in crisis, please call or text{" "}
              <strong className="text-slate-700">988</strong> (Suicide & Crisis Lifeline).
            </p>
          </div>
          <a href="tel:988" className="flex-shrink-0">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:scale-[0.97]">
              Call 988
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-12">
        <div className="page-container py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-indigo-400" />
            <span>© 2025 Mindora. Made with care.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-slate-600 transition-colors">Terms</Link>
            <Link href="/safety"  className="hover:text-slate-600 transition-colors">Safety</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
