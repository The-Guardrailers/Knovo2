import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";

export default function WorkspacesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
        <Users className="w-10 h-10 text-emerald-400" />
      </div>
      <h1 className="text-4xl font-black text-foreground">Workspaces</h1>
      <p
        className="text-lg max-w-md"
        style={{ color: "var(--text-secondary)" }}
      >
        Collaborative learning spaces with team quizzes, leaderboards, and
        debate competitions are on the way.
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
