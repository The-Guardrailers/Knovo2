"use client";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { getBestFeedbackByUserId } from "@/lib/actions/general.action";
import {
  Calendar,
  Star,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const LoadingSpinner = () => (
  <div className="relative flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-700 border-t-purple-500"></div>
    <div className="absolute animate-pulse rounded-full h-2 w-2 bg-purple-500"></div>
  </div>
);

const LoadingOverlay = ({
  isLoading,
  message,
}: {
  isLoading: boolean;
  message: string;
}) => {
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl border border-gray-700/50"
        style={{
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(30,27,75,0.95) 100%)",
        }}
      >
        <LoadingSpinner />
        <div className="text-center">
          <p className="text-gray-200 font-semibold text-lg mb-2">{message}</p>
          <div className="flex justify-center space-x-1.5">
            <div className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Feedback {
  totalScore: number;
}

const QuizCard = ({
  id,
  viewerId,
  userId,
  topic,
  type,
  createdAt,
}: QuizCardProps) => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!viewerId || !id) {
        setIsFetching(false);
        return;
      }
      try {
        const result = await getBestFeedbackByUserId({
          userId: viewerId,
          quizId: id,
        });
        setFeedback(result);
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
        setFeedback(null);
      } finally {
        setIsFetching(false);
      }
    };
    fetchFeedback();
  }, [id, viewerId]);

  const normalizedType = /random/gi.test(type) ? "Random" : type;
  const formattedDate = dayjs(createdAt || Date.now()).format("MMM D, YYYY");
  const [isLoading, setIsLoading] = useState(false);

  // Color palette based on quiz type
  const palette = (() => {
    const t = (type || "").toLowerCase();
    if (t.includes("multiple")) {
      return {
        border: "border-purple-500/30 hover:border-purple-500/60",
        glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]",
        chip: "bg-purple-500/15 text-purple-300 border border-purple-500/25",
        accent: "text-purple-400",
        btn: "from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20",
      };
    }
    if (t.includes("true") || t.includes("false")) {
      return {
        border: "border-emerald-500/30 hover:border-emerald-500/60",
        glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]",
        chip: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
        accent: "text-emerald-400",
        btn: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20",
      };
    }
    return {
      border: "border-amber-500/30 hover:border-amber-500/60",
      glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]",
      chip: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
      accent: "text-amber-400",
      btn: "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/20",
    };
  })();

  return (
    <>
      <LoadingOverlay
        isLoading={isLoading}
        message="Loading Quiz / Feedback ..."
      />

      <div
        className={`group relative overflow-hidden rounded-2xl border ${palette.border} transition-all duration-500 ${palette.glow} flex flex-col h-full`}
        style={{
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.9) 100%)",
        }}
      >
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-bl-full" />

        <div className="relative z-10 p-5 flex flex-col h-full">
          {/* Type chip — top, standalone row */}
          <div className="flex justify-end mb-3">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${palette.chip}`}
            >
              {normalizedType}
            </span>
          </div>

          {/* Title — full width, no overlap */}
          <h2 className="text-lg font-bold text-white capitalize leading-snug mb-3">
            {topic} Quiz
          </h2>

          {/* Meta row */}
          <div className="flex items-center gap-3 mb-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-gray-500" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 text-gray-500" />
              <span>
                {isFetching
                  ? "…"
                  : `${feedback?.totalScore?.toFixed(0) || "---"}`}
                /100
              </span>
            </div>
          </div>

          {/* Status message */}
          <div
            className={`px-3 py-2.5 rounded-xl text-xs border ${
              isFetching
                ? "bg-gray-800/50 border-gray-700/30 text-gray-400"
                : feedback
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  : "bg-gray-800/50 border-gray-700/30 text-gray-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {isFetching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              ) : feedback ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              )}
              <span>
                {isFetching
                  ? "Checking…"
                  : feedback
                    ? "Taken — check your feedback."
                    : "You haven't taken this quiz."}
              </span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1 min-h-4" />

          {/* CTA */}
          <div className="pt-4 border-t border-gray-700/40">
            <Link
              href={feedback ? `/quiz/${id}/feedback` : `/quiz/${id}`}
              onClick={() => setIsLoading(true)}
              className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${palette.btn} shadow-lg transition-all duration-300 hover:scale-[1.02]`}
            >
              {feedback ? "Check Feedback" : "Take Quiz"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizCard;
