import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground text-sm">Last updated: January 2025</p>
        <div className="space-y-6 text-foreground/80 text-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By using Mindora, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Not Medical Advice</h2>
            <p>Mindora and its AI companion Mira do not provide medical advice, diagnosis, or treatment. All content is for informational and wellness support purposes only. Always seek the advice of a qualified mental health professional for any mental health concerns.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. User Responsibilities</h2>
            <p>You agree not to use Mindora for unlawful purposes, to share false information, or to attempt to harm the platform or other users. You are responsible for maintaining the security of your account.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Subscriptions & Billing</h2>
            <p>Paid subscriptions are billed monthly through Stripe. You may cancel at any time. Refunds are handled on a case-by-case basis. We reserve the right to change pricing with 30 days notice.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Limitation of Liability</h2>
            <p>Mindora is provided "as is". We are not liable for any harm resulting from use of the service. In no event shall our liability exceed the amount paid by you in the preceding 3 months.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Changes to Terms</h2>
            <p>We may update these terms. Continued use after changes constitutes acceptance. We will notify users of material changes by email.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
