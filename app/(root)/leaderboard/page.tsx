import { getHighScoresWithUsers } from "@/lib/actions/general.action";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function Leaderboard() {
  const data = await getHighScoresWithUsers();

  const groupByType = (type: string) => data.filter((q) => q.type === type);

  return (
    <div className="p-6 w-full mx-auto">
      {/* Back to Dashboard */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-12 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-8 rounded-3xl shadow-2xl border-4 border-yellow-300">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="md:text-6xl text-4xl font-black text-white drop-shadow-2xl">
              Leaderboard
            </h1>
          </div>
          <p className="mt-4 text-lg text-white font-bold drop-shadow-lg">
            🌟 Top scorers across all quiz formats 🌟
          </p>
          <div className="mt-4 h-1 w-32 mx-auto bg-white rounded-full shadow-lg"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {["multiple choice", "true/false", "verbal"].map((typeLabel, index) => {
          const icons = ["🧠", "✅", "🗣️"];
          const columnGradients = [
            "bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-600",
            "bg-gradient-to-br from-green-400 via-green-500 to-emerald-600",
            "bg-gradient-to-br from-orange-400 via-red-500 to-pink-600",
          ];
          const headerGradients = [
            "from-blue-500 to-cyan-500",
            "from-green-500 to-emerald-500",
            "from-orange-500 to-red-500",
          ];

          return (
            <div
              key={typeLabel}
              className={`flex-1 p-6 rounded-3xl shadow-2xl ${columnGradients[index]}`}
            >
              <div className="mb-6 text-center">
                <div className="text-3xl mb-2">{icons[index]}</div>
                <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-2">
                  {typeLabel === "multiple choice"
                    ? "Multiple Choice"
                    : typeLabel === "true/false"
                      ? "True / False"
                      : "Verbal Answer"}
                </h3>
                <div className="h-0.5 w-16 mx-auto bg-white rounded-full shadow-lg"></div>
              </div>

              <div className="max-h-[65vh] overflow-y-auto space-y-4 pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.3)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-white/50 [&::-webkit-scrollbar-corner]:hidden [&::-webkit-scrollbar-button]:hidden">
                {groupByType(typeLabel).length === 0 && (
                  <div className="text-center py-8 text-white bg-black/20 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/30">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="text-sm font-medium">No quizzes yet</div>
                  </div>
                )}

                {groupByType(typeLabel).map((q) => (
                  <div
                    key={q.quizId}
                    className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-gray-700/50 shadow-lg hover:shadow-xl hover:bg-gray-700/90 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-2xl">📚</div>
                      <h4 className="font-bold text-xl text-gray-100 leading-tight">
                        {q.topic}
                      </h4>
                    </div>

                    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4">
                      {q.topScorers.length === 0 && (
                        <div className="text-center py-4 text-gray-400">
                          <div className="text-2xl mb-1">🎯</div>
                          <div className="text-sm font-medium">
                            No scores yet
                          </div>
                        </div>
                      )}

                      <ol className="space-y-3">
                        {q.topScorers.slice(0, 3).map((s, i) => {
                          const medals = ["🥇", "🥈", "🥉"];
                          const rankColors = [
                            "bg-gradient-to-r from-yellow-400 to-yellow-600",
                            "bg-gradient-to-r from-gray-400 to-gray-500",
                            "bg-gradient-to-r from-amber-600 to-amber-700",
                          ];

                          return (
                            <li
                              key={i}
                              className="flex items-center justify-between gap-4 p-3 bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-600/50 hover:border-gray-500/70 hover:bg-gray-700/90 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className="text-xl">{medals[i]}</span>
                                <span className="font-semibold text-gray-200 truncate">
                                  {s.name}
                                </span>
                              </div>
                              <div
                                className={`px-3 py-1 rounded-full text-white font-bold text-sm ${rankColors[i]} shadow-lg`}
                              >
                                {s.score}
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
