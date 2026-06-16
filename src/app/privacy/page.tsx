import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">Last updated: January 2025</p>
        <div className="prose prose-sm max-w-none space-y-6 text-foreground/80">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Data We Collect</h2>
            <p>We collect your email address, name, mood entries, journal entries, and chat messages with Mira. This data is used solely to provide and improve the Mindora service.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. How We Store Your Data</h2>
            <p>All data is stored securely on AWS infrastructure (DynamoDB, S3) in encrypted form. We use Amazon Cognito for authentication. We never sell your personal data to third parties.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. AI Processing</h2>
            <p>Your messages to Mira and journal entries are processed by Amazon Bedrock (Claude) to generate responses and insights. These interactions are not used to train AI models.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Payments</h2>
            <p>Payment processing is handled by Stripe. We never store your payment card details. Stripe's privacy policy applies to payment data.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Your Rights</h2>
            <p>You can request deletion of your account and all associated data at any time by contacting us. You can export your mood and journal data from the Settings page.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
            <p>For privacy concerns, contact us at privacy@mindora.app</p>
          </section>
        </div>
      </div>
    </div>
  );
}
