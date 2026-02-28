// app/(root)/workspaces/[id]/tutors/page.tsx
import { Code2, Plus, Users, Lock, ChevronRight } from "lucide-react";

export default function WorkspaceTutorsPage() {
  const tutors = [
    {
      name: "Senior Architect",
      role: "DSA & System Design",
      uses: 42,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      name: "Grammar Coach",
      role: "Essay & Language",
      uses: 18,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      name: "Strict Grader",
      role: "Mock Exams",
      uses: 5,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="p-6 sm:p-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Code2 className="w-8 h-8 text-emerald-400" /> Shared Tutors
          </h1>
          <p className="text-gray-400 text-base mt-2 max-w-xl">
            Create specialized AI personas tailored to your group's study
            material. They retain memory across all member interactions.
          </p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600/50 border border-emerald-500 text-white font-bold rounded-xl opacity-70 cursor-not-allowed">
          <Plus className="w-4 h-4" /> Create Tutor
          <span className="text-[10px] uppercase tracking-wider bg-emerald-900/80 px-2 py-0.5 rounded ml-2">
            Soon
          </span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {tutors.map((t, idx) => (
          <div
            key={idx}
            className="relative group bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${t.bg} border border-emerald-500/20 flex items-center justify-center mb-6`}
            >
              <Users className={`w-6 h-6 ${t.color}`} />
            </div>

            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
              {t.name}
            </h3>
            <p className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">
              {t.role}
            </p>

            <div className="flex items-center justify-between border-t border-gray-800 pt-4">
              <div className="text-sm text-gray-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-500/50" />
                Workspace Only
              </div>
              <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {t.uses} sessions
              </div>
            </div>

            <button className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl transition-colors font-semibold text-sm">
              Chat as Group <ChevronRight className="w-4 h-4" />
            </button>

            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[2px] rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 text-center">
              <span className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg font-bold shadow-2xl">
                Coming Soon
              </span>
            </div>
          </div>
        ))}

        {/* New Custom Tutor Blank State */}
        <div className="relative border-2 border-dashed border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center opacity-70">
          <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-400 mb-2">
            Upload Syllabus
          </h3>
          <p className="text-sm text-gray-600 max-w-[200px]">
            Feed PDFs and let Knovo dynamically generate a specialized group
            tutor.
          </p>
        </div>
      </div>
    </div>
  );
}
