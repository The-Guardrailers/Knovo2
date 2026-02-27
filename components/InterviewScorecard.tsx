"use client";

import React from "react";
import { InterviewScorecard as ScorecardType } from "@/constants/interview";
import {
  CheckCircle2,
  Brain,
  Bug,
  MessageCircle,
  Star,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface InterviewScorecardProps {
  scorecard: ScorecardType;
  problemTitle: string;
  duration: number; // seconds
}

const dimensionConfig = [
  {
    key: "correctness" as const,
    label: "Correctness",
    weight: "30%",
    icon: CheckCircle2,
    color: "emerald",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    key: "reasoning" as const,
    label: "Algorithmic Reasoning",
    weight: "30%",
    icon: Brain,
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    key: "debugging" as const,
    label: "Debugging Ability",
    weight: "20%",
    icon: Bug,
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    key: "clarity" as const,
    label: "Communication Clarity",
    weight: "20%",
    icon: MessageCircle,
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
  },
];

export default function InterviewScorecard({
  scorecard,
  problemTitle,
  duration,
}: InterviewScorecardProps) {
  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-blue-400";
    if (score >= 4) return "text-amber-400";
    return "text-red-400";
  };

  const getBarColor = (score: number) => {
    if (score >= 8) return "bg-emerald-500";
    if (score >= 6) return "bg-blue-500";
    if (score >= 4) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Interview Scorecard
            </h2>
            <p className="text-gray-400 text-sm">
              {problemTitle} · {formatDuration(duration)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div
                className={`text-4xl font-black ${getScoreColor(
                  scorecard.overallScore / 10,
                )}`}
              >
                {scorecard.overallScore}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                / 100
              </div>
            </div>
          </div>
        </div>

        {/* 4-Dimension Scores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dimensionConfig.map((dim) => {
            const score = scorecard[
              `${dim.key}Score` as keyof ScorecardType
            ] as number;
            const evidence = scorecard[
              `${dim.key}Evidence` as keyof ScorecardType
            ] as string;
            const Icon = dim.icon;

            return (
              <div
                key={dim.key}
                className="bg-gray-800/50 rounded-xl border border-gray-700/30 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 text-${dim.color}-400`} />
                    <span className="text-sm font-semibold text-gray-200">
                      {dim.label}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      ({dim.weight})
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                    {score}/10
                  </span>
                </div>

                {/* Score bar */}
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getBarColor(
                      score,
                    )}`}
                    style={{ width: `${score * 10}%` }}
                  />
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {evidence}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Behavioral Summary */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          Behavioral Summary
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          {scorecard.behavioralSummary}
        </p>
      </div>

      {/* Strengths & Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-900/20 to-gray-900 rounded-2xl border border-emerald-700/30 p-5">
          <h3 className="text-base font-bold text-emerald-300 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {scorecard.strengths.map((s, i) => (
              <li
                key={i}
                className="text-sm text-gray-300 flex items-start gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-amber-900/20 to-gray-900 rounded-2xl border border-amber-700/30 p-5">
          <h3 className="text-base font-bold text-amber-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {scorecard.areasForImprovement.map((a, i) => (
              <li
                key={i}
                className="text-sm text-gray-300 flex items-start gap-2"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Final Assessment */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-bold text-white mb-3">Final Assessment</h3>
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
          {scorecard.finalAssessment}
        </p>
      </div>

      {/* Back Button */}
      <div className="flex justify-center pt-2 pb-8">
        <Link
          href="/challenges"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 border border-gray-700/50 text-gray-300 hover:text-white hover:border-gray-600 transition-all text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Challenges
        </Link>
      </div>
    </div>
  );
}
