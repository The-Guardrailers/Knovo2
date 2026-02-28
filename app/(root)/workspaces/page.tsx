import Link from "next/link";
import {
  Users,
  Plus,
  ArrowRight,
  Settings,
  Hash,
  MoreVertical,
} from "lucide-react";

export default function WorkspacesPage() {
  // Mock Data for Workspaces
  const workspaces = [
    {
      id: "cs101-study-group",
      name: "CS101 Final Prep",
      members: 12,
      activeQuizzes: 3,
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/30",
    },
    {
      id: "debate-club",
      name: "Varsity Debate Club",
      members: 8,
      activeQuizzes: 1,
      color: "from-purple-500/20 to-indigo-500/20",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/30",
    },
    {
      id: "spanish-practice",
      name: "Spanish Conversationalists",
      members: 5,
      activeQuizzes: 0,
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
    },
  ];

  return (
    <div className="w-full max-w-[120rem] mx-auto p-4 sm:p-8 md:p-10 space-y-10">
      {/* ── Header Section ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold mb-6">
            <Users className="w-4 h-4" />
            Collaborative Learning
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Your Workspaces
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
            Create or join study groups, challenge your friends to live buzzer
            trivia, and share custom AI tutors within your private communities.
          </p>
        </div>

        {/* Create Workspace CTA */}
        <button className="group relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-500" />
          <div className="relative flex items-center gap-3 px-8 py-4 bg-gray-950 border border-indigo-500/50 rounded-2xl text-white font-bold text-lg hover:bg-gray-900 transition-all duration-300">
            <Plus className="w-5 h-5 text-indigo-400 group-hover:rotate-90 transition-transform duration-500" />
            Create Workspace
          </div>
        </button>
      </div>

      {/* ── Workspaces Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {workspaces.map((ws) => (
          <Link
            key={ws.id}
            href={`/workspaces/${ws.id}`}
            className={`group relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/40 p-6 flex flex-col transition-all duration-500 hover:border-gray-700 hover:bg-gray-800/60`}
          >
            {/* Background Gradient Accent */}
            <div
              className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${ws.color} rounded-bl-full opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
            />

            <div className="flex justify-between items-start mb-6">
              <div
                className={`w-14 h-14 rounded-2xl bg-gray-950 flex items-center justify-center border ${ws.borderColor} shadow-lg`}
              >
                <Hash className={`w-7 h-7 ${ws.iconColor}`} />
              </div>
              <button className="p-2 text-gray-500 hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                {ws.name}
              </h2>

              <div className="flex items-center gap-4 text-sm font-medium mt-4">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Users className="w-4 h-4 text-gray-500" />
                  {ws.members} Members
                </div>
                {ws.activeQuizzes > 0 && (
                  <div className="flex items-center gap-1.5 text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {ws.activeQuizzes} Active
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-gray-800/60 group-hover:border-gray-700 transition-colors">
              <span className="text-sm font-semibold text-gray-500 group-hover:text-white transition-colors">
                Enter Workspace
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}

        {/* Join Workspace Blank Card */}
        <button className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 p-6 transition-all duration-300 min-h-[280px]">
          <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-300 mb-4">
            <Plus className="w-8 h-8 text-gray-500 group-hover:text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-400 group-hover:text-indigo-300 transition-colors">
            Join with code
          </h3>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Have an invite link or code? Click here to join an existing group.
          </p>
        </button>
      </div>
    </div>
  );
}
