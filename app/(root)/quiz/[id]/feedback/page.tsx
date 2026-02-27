import dayjs from "dayjs";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getFeedbackByQuizId,
  getQuizById,
  getBestFeedbackByUserId,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

interface QuizResult {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  status: "Correct" | "Incorrect" | "Skipped";
}

const parseAnswerKeyResults = (finalAssessment: string): QuizResult[] => {
  const results: QuizResult[] = [];

  const text = finalAssessment.toLowerCase();

  if (!text.includes("question") || !text.includes("correct answer")) {
    return results;
  }

  const questionPattern =
    /Question\s+(\d+):\s*([^✓]*?)✓?\s*Correct Answer:\s*([^Y]*?)Your Answer:\s*([^-]*?)\s*-\s*(Correct|Incorrect|Skipped)/gi;

  let match;
  while ((match = questionPattern.exec(finalAssessment)) !== null) {
    const [, questionNum, questionText, correctAnswer, userAnswer, status] =
      match;

    results.push({
      question: questionText.trim(),
      correctAnswer: correctAnswer.trim(),
      userAnswer: userAnswer.trim() || "No response",
      status: status as "Correct" | "Incorrect" | "Skipped",
    });
  }

  if (results.length === 0) {
    const lines = finalAssessment.split("\n");
    let currentQuestion = "";
    let correctAnswer = "";
    let userAnswer = "";
    let status: "Correct" | "Incorrect" | "Skipped" = "Skipped";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (/Question\s+\d+:/i.test(line)) {
        if (currentQuestion && correctAnswer) {
          results.push({
            question: currentQuestion,
            correctAnswer: correctAnswer,
            userAnswer: userAnswer || "No response",
            status: status,
          });
        }

        currentQuestion = line.replace(/Question\s+\d+:\s*/i, "").trim();
        correctAnswer = "";
        userAnswer = "";
        status = "Skipped";
      } else if (line.includes("Correct Answer:")) {
        correctAnswer = line.replace(/.*Correct Answer:\s*/i, "").trim();
      } else if (line.includes("Your Answer:")) {
        const answerMatch = line.match(
          /Your Answer:\s*(.+?)\s*-\s*(Correct|Incorrect|Skipped)/i,
        );
        if (answerMatch) {
          userAnswer = answerMatch[1].trim();
          status = answerMatch[2] as "Correct" | "Incorrect" | "Skipped";
        }
      }
    }

    if (currentQuestion && correctAnswer) {
      results.push({
        question: currentQuestion,
        correctAnswer: correctAnswer,
        userAnswer: userAnswer || "No response",
        status: status,
      });
    }
  }

  return results;
};

const QuizResultsTable = ({ results }: { results: QuizResult[] }) => {
  if (results.length === 0) return null;

  return (
    <div className="mt-6 sm:mt-8">
      <div
        className="rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.9) 100%)",
        }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-700/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Quiz Results</h2>
              <p className="text-xs text-gray-500">
                Detailed breakdown of your performance
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700/30">
            <thead>
              <tr className="bg-gray-900/40">
                <th className="px-4 sm:px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider border-r border-gray-700/20">
                  Question
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider border-r border-gray-700/20">
                  Your Answer
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider border-r border-gray-700/20">
                  Correct Answer
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/20">
              {results.map((result, index) => (
                <tr
                  key={index}
                  className={`transition-colors duration-200 hover:bg-white/[0.02] ${
                    index % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
                  }`}
                >
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-300 max-w-xs sm:max-w-md border-r border-gray-700/10">
                    <div className="break-words leading-relaxed">
                      {result.question}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm border-r border-gray-700/10">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${
                        result.status === "Correct"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                          : result.status === "Incorrect"
                            ? "bg-red-500/10 text-red-300 border-red-500/25"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/25"
                      }`}
                    >
                      {result.userAnswer}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-200 border-r border-gray-700/10">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full shrink-0"></div>
                      {result.correctAnswer}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
                        result.status === "Correct"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : result.status === "Incorrect"
                            ? "bg-red-500/10 text-red-300"
                            : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {result.status === "Correct" && "✓"}
                      {result.status === "Incorrect" && "✗"}
                      {result.status === "Skipped" && "○"}
                      {result.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const quiz = await getQuizById(id);
  if (!quiz) redirect("/");

  const feedback = await getFeedbackByQuizId({
    quizId: id,
    userId: user?.id!,
  });

  const quizResults = feedback?.finalAssessment
    ? parseAnswerKeyResults(feedback.finalAssessment)
    : [];

  const filteredAssessment = feedback?.finalAssessment
    ? feedback.finalAssessment
        .replace(/Answer Key & Results\s*:[\s\S]*$/, "")
        .trim()
    : "";

  return (
    <div className="w-full p-4 sm:p-6 md:p-8">
      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-8 sm:p-10 text-center mb-8 shadow-2xl"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e3a5f 75%, #0f172a 100%)",
        }}
      >
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-indigo-500/15 rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-0 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest">
              Quiz Feedback
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            <span className="bg-gradient-to-r from-purple-300 via-pink-200 to-blue-300 bg-clip-text text-transparent capitalize">
              {quiz.topic} Quiz
            </span>
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <svg
                className="w-3.5 h-3.5 text-amber-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>
                Score:{" "}
                <strong className="text-white">{feedback?.totalScore}</strong>
                /100
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <svg
                className="w-3.5 h-3.5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {feedback?.createdAt
                  ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results Table or Summary ──────────────────────────────── */}
      {quizResults.length > 0 ? (
        <QuizResultsTable results={quizResults} />
      ) : (
        <div
          className="rounded-2xl border border-gray-700/50 p-6 sm:p-8 mb-6"
          style={{
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.9) 100%)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">Summary & Results</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {filteredAssessment || feedback?.finalAssessment}
          </p>
        </div>
      )}

      {/* ── Performance Breakdown ────────────────────────────────── */}
      <div
        className="rounded-2xl border border-gray-700/50 p-6 sm:p-8 mt-6"
        style={{
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.9) 100%)",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
          <h2 className="text-xl font-bold text-white">
            Performance Breakdown
          </h2>
        </div>
        <div className="space-y-5">
          {feedback?.categoryScores?.map((category, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-sm font-semibold text-gray-200">
                  {index + 1}. {category.name}
                </p>
                <p className="text-xs font-bold text-purple-400">
                  {category.score}/100
                </p>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
                  style={{ width: `${category.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {category.comment}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Strengths & Improvements ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {/* Strengths */}
        <div
          className="rounded-2xl border border-gray-700/50 p-6"
          style={{
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.9) 100%)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
            <h3 className="text-lg font-bold text-white">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {feedback?.strengths?.map((strength, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-emerald-300"
              >
                <span className="mt-1 w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                <span className="text-gray-300">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div
          className="rounded-2xl border border-gray-700/50 p-6"
          style={{
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.9) 100%)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
            <h3 className="text-lg font-bold text-white">
              Areas for Improvement
            </h3>
          </div>
          <ul className="space-y-2">
            {feedback?.areasForImprovement?.map((area, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-1 w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                <span className="text-gray-300">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Action Buttons ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-300 border border-gray-700/50 hover:bg-white/5 transition-all duration-200"
          style={{
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.9) 100%)",
          }}
        >
          Back to Dashboard
        </Link>
        <Link
          href={`/quiz/${id}`}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02]"
        >
          Retake Quiz
        </Link>
      </div>
    </div>
  );
};

export default Feedback;
