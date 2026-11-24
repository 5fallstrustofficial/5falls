import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-[#f9fafb]">
      <div className="max-w-md p-8 bg-white rounded-modal border border-[#dce2ea] shadow-sm">
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 inline-block">
          404 · Not Found
        </span>
        <h2 className="text-3xl font-bold text-ink mb-2">Page Not Found</h2>
        <p className="text-sm text-ink-slate mb-6">
          The page you are looking for does not exist or has been relocated.
        </p>
        <Link href="/" className="pill-primary text-sm h-9 px-5 gap-1.5 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to 5Falls Home</span>
        </Link>
      </div>
    </div>
  );
}
