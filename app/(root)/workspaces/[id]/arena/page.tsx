// app/(root)/workspaces/[id]/arena/page.tsx
import {
  Mic,
  MicOff,
  MessageSquare,
  Plus,
  Send,
  Zap,
  UserX,
  Crown,
  Volume2,
} from "lucide-react";

export default function WorkspaceArenaPage() {
  const users = [
    {
      name: "You (Dive)",
      status: "listening",
      mic: true,
      avatar: "bg-indigo-500/20 text-indigo-400",
    },
    {
      name: "Sarah",
      status: "listening",
      mic: false,
      avatar: "bg-emerald-500/20 text-emerald-400",
    },
    {
      name: "Mike",
      status: "buzzed",
      mic: true,
      avatar:
        "bg-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] border-amber-500",
    },
    {
      name: "Alex (Away)",
      status: "away",
      mic: false,
      avatar: "bg-gray-800 text-gray-500",
    },
  ];

  return (
    <div className="flex h-full w-full bg-gray-950 overflow-hidden relative">
      {/* ── Main Arena Surface ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative z-0">
        {/* Top Header / Status */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/40">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <h1 className="text-white font-bold tracking-wide">
              Live Buzzer Arena
            </h1>
            <span className="text-gray-500 text-sm px-2 border-l border-gray-700 ml-2">
              Round 3 of 10
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors">
              <UserX className="w-5 h-5" />
            </button>
            <button className="px-4 py-1.5 bg-red-500/10 text-red-500 text-sm font-bold rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors">
              Leave Arena
            </button>
          </div>
        </div>

        {/* Center Stage: AI Quiz Master & Central Buzzer */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 overflow-y-auto">
          {/* The AI Quiz Master */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative mb-4">
              {/* Speaking animation rings */}
              <div
                className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping"
                style={{ animationDuration: "2s" }}
              />
              <div
                className="absolute inset-[-10px] rounded-full border border-purple-500/20 animate-ping"
                style={{ animationDuration: "3s", animationDelay: "0.5s" }}
              />

              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.4)] z-10 relative">
                <Crown className="w-10 h-10 text-white" />
              </div>

              {/* Level indicator */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-900 border-2 border-indigo-500 flex items-center justify-center z-20">
                <Volume2 className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Knovo Judge
            </h2>
            <p className="text-indigo-300 text-sm font-medium uppercase tracking-widest mt-1">
              Quiz Master
            </p>
            <div className="mt-4 px-6 py-3 bg-gray-900/80 border border-gray-800 rounded-2xl max-w-md text-center shadow-xl">
              <p className="text-gray-300 italic">
                "Listen closely. Which sorting algorithm has an average time
                complexity of O(n log n) and relies on a pivot element?"
              </p>
            </div>
          </div>

          {/* BIG BUZZER */}
          <div className="relative group cursor-not-allowed">
            <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <button className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-[inset_0_4px_20px_rgba(255,255,255,0.3),_0_10px_40px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center border-b-8 border-red-900 active:border-b-0 active:translate-y-2 transition-all duration-100 hover:scale-[1.02]">
              <Zap className="w-12 h-12 text-white mb-2 shadow-black/50 overflow-visible" />
              <span className="text-white font-black text-2xl tracking-widest uppercase">
                Buzz
              </span>
            </button>
          </div>

          {/* Connected Users Grid */}
          <div className="w-full max-w-2xl mt-8">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">
              Connected Players (4)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {users.map((u, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center p-4 rounded-2xl bg-gray-900 border transition-all ${u.status === "buzzed" ? "border-amber-500 shadow-lg shadow-amber-900/20" : "border-gray-800"}`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 relative border-2 ${u.avatar} ${u.status === "buzzed" ? "border-amber-500" : "border-transparent"}`}
                  >
                    <span className="text-lg font-bold">{u.name[0]}</span>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                      {u.mic ? (
                        <Mic className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <MicOff className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white truncate w-full text-center">
                    {u.name}
                  </span>
                  {u.status === "buzzed" ? (
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mt-1 bg-amber-500/10 px-2 rounded">
                      Answering!
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                      {u.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Discord-Style Chat Sidebar ────────────────────────────────── */}
      <div className="w-80 border-l border-gray-800 bg-gray-900/50 flex flex-col shrink-0 hidden lg:flex relative z-0">
        <div className="h-16 border-b border-gray-800 flex items-center px-4 shrink-0">
          <MessageSquare className="w-5 h-5 text-gray-400 mr-2" />
          <h2 className="text-white font-bold">Arena Chat</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center my-4">
            <span className="text-xs text-gray-600 font-medium bg-gray-800 px-3 py-1 rounded-full">
              Today at 10:42 AM
            </span>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-sm font-bold mt-1">
              S
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-white">Sarah</span>
                <span className="text-[10px] text-gray-500">10:45 AM</span>
              </div>
              <p className="text-sm text-gray-300 mt-0.5">Is it quicksort?</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 mt-1">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-purple-400">
                  Knovo Judge
                </span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded ml-1">
                  AI
                </span>
                <span className="text-[10px] text-gray-500">10:46 AM</span>
              </div>
              <p className="text-sm text-gray-300 mt-0.5">
                Incorrect, Sarah. Quicksort's worst case is O(n^2). Mike buzzed
                in! Mike, what is your answer?
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-900 shrink-0">
          <div className="relative">
            <button className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
            <input
              type="text"
              disabled
              placeholder="Chat disabled in preview..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500/50 cursor-not-allowed"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-400 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
