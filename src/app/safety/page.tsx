import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CRISIS_RESOURCES } from "@/types";
import { Shield, Phone, Heart, ArrowLeft } from "lucide-react";

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Safety & Crisis Resources</h1>
            <p className="text-muted-foreground text-sm">We care about your wellbeing deeply.</p>
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-red-800 text-lg flex items-center gap-2">
            <Phone className="w-5 h-5" /> If you're in immediate danger
          </h2>
          <p className="text-red-700 text-sm">Please call emergency services <strong>911</strong> or go to your nearest emergency room immediately.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CRISIS_RESOURCES.map((r) => (
              <a key={r.name} href={r.url} className="flex flex-col gap-1 bg-white border border-red-200 rounded-xl p-4 hover:bg-red-50 transition-colors">
                <span className="font-semibold text-sm text-red-800">{r.name}</span>
                <span className="text-xs text-red-600">{r.contact}</span>
                <span className="text-xs text-muted-foreground">{r.available}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
          <h2 className="font-bold text-amber-800">Important Disclaimer</h2>
          <div className="space-y-2 text-sm text-amber-700">
            <p>Mindora is a <strong>mental wellness support tool</strong>, not a licensed medical service or therapy platform.</p>
            <p>Mira (our AI companion) is <strong>not a licensed therapist, psychologist, or mental health professional</strong>. She cannot diagnose conditions, prescribe treatments, or replace professional care.</p>
            <p>Mindora is intended to complement — never replace — professional mental health treatment.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-green-800">Mindora is:</h3>
            <ul className="space-y-1 text-sm text-green-700">
              <li>✅ A daily mood tracking tool</li>
              <li>✅ A private journal with AI reflections</li>
              <li>✅ A CBT-inspired conversational companion</li>
              <li>✅ A resource for coping strategies</li>
              <li>✅ A safe space to express yourself</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-red-800">Mindora is not:</h3>
            <ul className="space-y-1 text-sm text-red-700">
              <li>❌ A licensed therapy service</li>
              <li>❌ A medical diagnosis tool</li>
              <li>❌ A crisis intervention service</li>
              <li>❌ A replacement for medication</li>
              <li>❌ A substitute for human connection</li>
            </ul>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
          <Heart className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-indigo-800 mb-1">We genuinely care about you</h3>
            <p className="text-sm text-indigo-700">If you ever feel unsafe or overwhelmed, please reach out to a professional immediately. You matter, and help is always available.</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90">
              Return to Mindora
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
