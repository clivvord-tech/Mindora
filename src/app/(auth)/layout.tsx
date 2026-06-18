import Link from "next/link";
import { Heart } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 flex flex-col">
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-indigo-700 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">Mindora</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        {children}
      </main>

      <footer className="p-4 text-center text-xs text-slate-400">
        Mindora is not a substitute for professional mental health treatment.{" "}
        <a href="tel:988" className="underline hover:text-slate-600 transition-colors">
          Crisis? Call/text 988
        </a>
      </footer>
    </div>
  );
}
