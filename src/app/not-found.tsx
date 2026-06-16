import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-glow animate-float">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold gradient-text">404</h1>
          <h2 className="text-xl font-semibold">Page not found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist. Let's get you back on track.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button variant="outline" className="border-indigo-200">Go home</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
