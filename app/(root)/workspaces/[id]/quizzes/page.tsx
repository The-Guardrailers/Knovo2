// app/(root)/workspaces/[id]/quizzes/page.tsx
import LeaderboardPage from "@/app/(root)/leaderboard/page";
import { Plus, BrainCircuit, Lock } from "lucide-react";
import QuizCard from "@/components/QuizCard";

export default async function WorkspaceQuizzesPage() {
  // Mock quizzes for demonstration purposes
  const mockQuizzes = [
    {
      id: "mock-quiz-1",
      topic: "Javascript Advanced Concepts",
      description: "Closures, Event Loop, and Asynchronous JS fundamentals.",
      createdAt: new Date(),
      type: "multiple choice",
      difficulty: "Hard",
    },
    {
      id: "mock-quiz-2",
      topic: "Data Structures 101",
      description: "Arrays, LinkedLists, Trees, and HashMaps.",
      createdAt: new Date(),
      type: "verbal",
      difficulty: "Medium",
    },
    {
      id: "mock-quiz-3",
      topic: "System Design Basics",
      description: "Load balancing, caching, and horizontal scaling.",
      createdAt: new Date(),
      type: "true/false",
      difficulty: "Hard",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden w-full">
      {/* Top Header / Action Bar */}
      <div className="p-6 sm:px-10 border-b border-gray-800 bg-gray-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 w-full">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-indigo-400" /> Group Quizzes
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Compete against workspace members in custom AI-generated quizzes.
          </p>
        </div>

        <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600/50 border border-indigo-500 text-white font-bold rounded-lg opacity-70 cursor-not-allowed">
          <Plus className="w-4 h-4" /> Create Quiz
          <span className="text-[10px] uppercase tracking-wider bg-indigo-900/80 px-2 py-0.5 rounded ml-2">
            Soon
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-6 sm:p-10 w-full">
          {/* Active Group Quizzes */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full" />
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Active Group Quizzes
                <Lock className="w-4 h-4 text-gray-500 ml-2" />
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {mockQuizzes.map((quiz) => (
                // We must cast quiz to any because our mock data lacks some DB fields, but QuizCard only strictly requires a few for UI display
                <QuizCard {...(quiz as any)} key={quiz.id} />
              ))}
            </div>
          </div>

          {/* Embedded Leaderboard */}
          <div className="relative w-full pb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full" />
              <h2 className="text-xl font-bold text-white">
                Group Leaderboards
              </h2>
            </div>

            {/* Embed the Leaderboard within a fully constrained box so it expands naturally. 
                   The leaderboard component handles its own internal layout perfectly. */}
            <div className="w-full relative shadow-2xl rounded-3xl overflow-hidden border border-gray-800/50 bg-gray-950/20 backdrop-blur-sm -mx-6 px-6 pb-6">
              <LeaderboardPage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
