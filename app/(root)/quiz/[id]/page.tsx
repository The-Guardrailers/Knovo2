import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByQuizId, getQuizById } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import React from "react";
import Agent from "@/components/Agent";

const QuizPage = async ({ params }: RouteParams) => {
  const { id } = await params;
  const quiz = await getQuizById(id);
  const user = await getCurrentUser();

  if (!quiz) redirect("/");

  const feedback = await getFeedbackByQuizId({
    quizId: id,
    userId: user?.id!,
  });

  return (
    <div className="w-full p-4 sm:p-6 md:p-8">
      {/* Header Section with Quiz Info */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 p-6 sm:p-8 mb-6 shadow-xl"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #1e3a5f 100%)",
        }}
      >
        {/* Glow orb */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500/15 rounded-full blur-[80px] animate-pulse" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 flex flex-row gap-6 justify-between items-center">
          <div className="flex flex-row gap-4 items-center max-sm:flex-col">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  Live Quiz
                </span>
              </div>
              <h2 className="capitalize text-3xl font-black">
                <span className="bg-gradient-to-r from-purple-300 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
                  {quiz.topic} Quiz
                </span>
              </h2>
            </div>
          </div>

          <div className="shrink-0">
            <span className="px-4 py-2 rounded-xl text-sm font-bold text-white uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 shadow-lg shadow-purple-500/20">
              {quiz.type}
            </span>
          </div>
        </div>
      </div>

      {/* Agent Component */}
      <div
        className="rounded-2xl p-4 border border-gray-700/40 overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.6) 0%, rgba(30,27,75,0.4) 100%)",
        }}
      >
        <Agent
          userName={user?.name!}
          userId={user?.id}
          quizId={id}
          type="quiz"
          quizType={quiz.type}
          questions={quiz.questions}
          feedbackId={feedback?.id}
        />
      </div>
    </div>
  );
};

export default QuizPage;
