"use client";
import QuizForm from "@/components/QuizForm";
import QuizCard from "@/components/QuizCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getLatestQuizzes,
  getQuizzesByUserId,
} from "@/lib/actions/general.action";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  Mic,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  Loader2,
  ClipboardList,
} from "lucide-react";

const QuizPage = () => {
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser?.id) {
        const [myQuizzes, latest] = await Promise.all([
          getQuizzesByUserId(currentUser.id),
          getLatestQuizzes({ userId: currentUser.id }),
        ]);
        setUserQuizzes(myQuizzes || []);
        setAllQuizzes(latest || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // ── Quiz Form View ──────────────────────────────────────────────────
  if (showQuizForm) {
    return (
      <div className="w-full p-4 sm:p-6 md:p-8">
        {/* Back button */}
        <button
          onClick={() => setShowQuizForm(false)}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </button>

        {/* Header */}
        <div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8 text-center mb-6 shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e3a5f 75%, #0f172a 100%)",
          }}
        >
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/15 rounded-full blur-[80px] animate-pulse"
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest">
                AI Generation
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tight">
              <span className="bg-gradient-to-r from-purple-300 via-pink-200 to-blue-300 bg-clip-text text-transparent">
                Generate Your Quiz
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300/90 leading-relaxed max-w-xl mx-auto font-light">
              Enter a topic or upload a PDF — our AI will craft a personalized
              quiz tailored to your preferences.
            </p>

            {/* Feature pills */}
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/20 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300">
                  AI Powered
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-sm">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-blue-300">
                  Topic or PDF
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 backdrop-blur-sm">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">
                  Customizable
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form — full width matching the header */}
        {user?.id && <QuizForm userId={user.id} />}
      </div>
    );
  }

  // ── Main Quiz Dashboard ─────────────────────────────────────────────
  return (
    <div className="w-full p-4 sm:p-6 md:p-8 space-y-8">
      {/* Back to Dashboard */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-8 sm:p-12 md:p-16 text-center shadow-2xl"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e3a5f 75%, #0f172a 100%)",
        }}
      >
        {/* Animated glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest">
              Premium Feature
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-purple-300 via-pink-200 to-blue-300 bg-clip-text text-transparent">
              Custom Quizzes
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300/90 leading-relaxed max-w-2xl mx-auto font-light">
            Generate AI-powered quizzes from any topic or PDF. Choose your
            format, difficulty, and test your mastery.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/20 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-purple-300">
                AI Generated
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-sm">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-blue-300">
                PDF Support
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 backdrop-blur-sm">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">
                Multiple Formats
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-400/20 backdrop-blur-sm">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-300">
                Voice Quizzes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Generation Method Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Form-Based Generation */}
        <button
          onClick={() => setShowQuizForm(true)}
          className="group relative text-left overflow-hidden rounded-2xl border border-gray-700/60 p-6 sm:p-8 transition-all duration-500 hover:border-purple-500/60 hover:shadow-[0_0_40px_rgba(168,85,247,0.12)]"
          style={{
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.9) 100%)",
          }}
        >
          {/* Hover glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500" />
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full group-hover:bg-purple-500/10 transition-all duration-500" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                <FileText className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                  Form Based Generation
                </h2>
                <span className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-semibold">
                  Topic or PDF
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Enter a topic or upload a PDF document. Configure quiz type,
              difficulty level, and number of questions — AI handles the rest.
            </p>

            {/* Feature tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/15 text-[11px] font-medium text-purple-300">
                <ClipboardList className="w-3 h-3" /> Customizable
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-pink-500/10 border border-pink-500/15 text-[11px] font-medium text-pink-300">
                <FileText className="w-3 h-3" /> PDF Upload
              </span>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
              <span className="text-sm font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
                Create Quiz
              </span>
              <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:translate-x-1 transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-purple-400" />
              </div>
            </div>
          </div>
        </button>

        {/* Voice Based Generation */}
        <Link
          href="https://knovo-dhlb.vercel.app/quiz/vic-workflow"
          className="group relative text-left overflow-hidden rounded-2xl border border-gray-700/60 p-6 sm:p-8 transition-all duration-500 hover:border-cyan-500/60 hover:shadow-[0_0_40px_rgba(6,182,212,0.12)]"
          style={{
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 100%)",
          }}
        >
          {/* Hover glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-teal-500/0 group-hover:from-cyan-500/5 group-hover:to-teal-500/5 transition-all duration-500" />
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full group-hover:bg-cyan-500/10 transition-all duration-500" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                <Mic className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-200 transition-colors duration-300">
                  Voice Based Generation
                </h2>
                <span className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-semibold">
                  Conversational
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Describe your quiz topic through voice. Our AI assistant will
              create a tailored quiz from your spoken instructions in real-time.
            </p>

            {/* Feature tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/15 text-[11px] font-medium text-cyan-300">
                <Mic className="w-3 h-3" /> Voice Input
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/15 text-[11px] font-medium text-teal-300">
                <Sparkles className="w-3 h-3" /> AI Powered
              </span>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
              <span className="text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                Start Voice Session
              </span>
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:translate-x-1 transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Your Quizzes ───────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />
          <h2 className="text-2xl font-bold text-white">Your Quizzes</h2>
        </div>
        {loading ? (
          <div className="flex items-center gap-3 text-gray-400 py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading quizzes…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {userQuizzes.length > 0 ? (
              userQuizzes.map((quiz) => (
                <QuizCard {...quiz} key={quiz.id} viewerId={user?.id} />
              ))
            ) : (
              <p className="text-gray-500 col-span-full">
                You haven&apos;t taken any quizzes yet
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── Take a Quiz ────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
          <h2 className="text-2xl font-bold text-white">Take a Quiz</h2>
        </div>
        {loading ? (
          <div className="flex items-center gap-3 text-gray-400 py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading quizzes…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allQuizzes.length > 0 ? (
              allQuizzes.map((quiz) => (
                <QuizCard {...quiz} key={quiz.id} viewerId={user?.id} />
              ))
            ) : (
              <p className="text-gray-500 col-span-full">
                There are no new quizzes available
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
export default QuizPage;
