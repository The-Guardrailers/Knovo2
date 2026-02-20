import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export default function PdfExplainerPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <div className="w-20 h-20 rounded-2xl bg-blue-500/20 flex items-center justify-center">
        <FileText className="w-10 h-10 text-blue-400" />
      </div>
      <h1 className="text-4xl font-black text-foreground">
        Voice PDF Explainer
      </h1>
      <p
        className="text-lg max-w-md"
        style={{ color: "var(--text-secondary)" }}
      >
        Upload any PDF and get it explained with AI voice narration —
        line-by-line or paragraph-by-paragraph.
      </p>
      <span className="px-4 py-2 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-300 text-sm font-medium">
        🚧 Coming Soon
      </span>
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors mt-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
