import Link from "next/link";
import { Heart } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">Mindora</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        {children}
      </main>

      {/* Safety footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground">
        <p>
          Mindora is not a substitute for professional mental health treatment.{" "}
          <a href="tel:988" className="underline hover:text-foreground">
            Crisis? Call/text 988
          </a>
        </p>
      </footer>
    </div>
  );
}
