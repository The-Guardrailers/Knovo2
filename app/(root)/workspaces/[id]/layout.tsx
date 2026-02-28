"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Users,
  BrainCircuit,
  Code2,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { InviteMemberDialog } from "./InviteMemberDialog";

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const pathname = usePathname();

  // Extract workspace ID directly from the URL pathname
  // pathname looks like /workspaces/cs101-study-group or /workspaces/cs101-study-group/quizzes
  const segments = pathname.split("/");
  const workspaceIdx = segments.indexOf("workspaces");
  const id = workspaceIdx !== -1 ? segments[workspaceIdx + 1] : "";

  // Helper to check if a route is active
  const isActive = (pathSuffix: string) => {
    if (pathSuffix === "") {
      return pathname === `/workspaces/${id}`;
    }
    return pathname.includes(`/workspaces/${id}/${pathSuffix}`);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-gray-950">
      {/* ── Sidebar Navigation ────────────────────────────────────────── */}
      <aside className="w-64 border-r border-gray-800 bg-gray-950 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-gray-800">
          <Link
            href="/workspaces"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Workspaces
          </Link>
          <h2 className="text-xl font-bold text-white truncate px-1">
            Group Workspace
          </h2>
          <p className="text-xs text-indigo-400 font-medium px-1 uppercase tracking-widest mt-1">
            #{id}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <Link
            href={`/workspaces/${id}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors font-medium text-sm ${
              isActive("")
                ? "bg-gray-800/80 text-white border-gray-700 shadow-sm"
                : "text-gray-400 border-transparent hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview
          </Link>

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
              Study Modules
            </p>
          </div>

          <Link
            href={`/workspaces/${id}/quizzes`}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all font-medium text-sm ${
              isActive("quizzes")
                ? "text-indigo-300 bg-indigo-500/20 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                : "text-indigo-400/80 border-transparent hover:bg-indigo-500/10 hover:border-indigo-500/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <BrainCircuit
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive("quizzes") ? "text-indigo-400" : ""}`}
              />
              Custom Quizzes
            </div>
          </Link>

          <Link
            href={`/workspaces/${id}/tutors`}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all font-medium text-sm ${
              isActive("tutors")
                ? "text-emerald-300 bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                : "text-emerald-400/80 border-transparent hover:bg-emerald-500/10 hover:border-emerald-500/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <Code2
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive("tutors") ? "text-emerald-400" : ""}`}
              />
              Shared Tutors
            </div>
          </Link>

          <Link
            href={`/workspaces/${id}/arena`}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all font-medium text-sm ${
              isActive("arena")
                ? "text-amber-300 bg-amber-500/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                : "text-amber-400/80 border-transparent hover:bg-amber-500/10 hover:border-amber-500/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive("arena") ? "text-amber-400" : ""}`}
              />
              Buzzer Arena
            </div>
          </Link>

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
              Management
            </p>
          </div>

          <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent transition-colors font-medium text-sm">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" /> Members
            </div>
            <div className="w-5 h-5 rounded bg-gray-800 flex items-center justify-center text-xs text-gray-300">
              12
            </div>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent transition-colors font-medium text-sm">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </nav>

        {/* Invite Member CTA */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/40">
          <InviteMemberDialog />
        </div>
      </aside>

      {/* ── Main Content Area — FULL WIDTH, no constraints ─────────── */}
      <main className="flex-1 overflow-y-auto bg-gray-950 relative w-full">
        {children}
      </main>
    </div>
  );
}
