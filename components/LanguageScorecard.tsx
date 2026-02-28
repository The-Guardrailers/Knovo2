import React from "react";
import { LanguageScorecard as ScorecardType } from "@/constants/language";
import {
  Trophy,
  Activity,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  BookOpen,
  Mic,
  BrainCircuit,
} from "lucide-react";

interface LanguageScorecardProps {
  scorecard: ScorecardType;
  scenarioTitle: string;
  duration: number; // in seconds
}

export default function LanguageScorecardComponent({
  scorecard,
  scenarioTitle,
  duration,
}: LanguageScorecardProps) {
  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}m ${sec}s`;
  };

  const ScoreCircle = ({ score, label, icon: Icon, colorClass }: any) => {
    const percentage = score * 10;
    return (
      <div className="flex flex-col items-center p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
        <div className="relative w-20 h-20 flex items-center justify-center mb-3">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-800"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * percentage) / 100}
              className={`${colorClass} transition-all duration-1000`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">{score}</span>
            <span className="text-[10px] text-gray-500">/10</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-300">
          <Icon className="w-4 h-4" />
          {label}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40 rounded-3xl border border-indigo-500/30 p-8 sm:p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Trophy className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-6">
            <Activity className="w-4 h-4" />
            Language Assessment Complete
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight shadow-sm">
            {scorecard.overallScore}{" "}
            <span className="text-2xl text-indigo-300/80">/ 100</span>
          </h1>
          <h2 className="text-xl sm:text-2xl text-indigo-100 font-medium mb-2">
            Scenario: {scenarioTitle}
          </h2>
          <p className="text-indigo-300/80 flex items-center justify-center gap-2 font-mono bg-black/20 px-4 py-1 rounded-lg">
            Duration: {formatTime(duration)}
          </p>
        </div>
      </div>

      {/* ── Dimension Scores ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreCircle
          score={scorecard.fluencyScore}
          label="Fluency"
          icon={MessageSquare}
          colorClass="text-blue-500"
        />
        <ScoreCircle
          score={scorecard.grammarScore}
          label="Grammar"
          icon={BrainCircuit}
          colorClass="text-purple-500"
        />
        <ScoreCircle
          score={scorecard.vocabularyScore}
          label="Vocabulary"
          icon={BookOpen}
          colorClass="text-pink-500"
        />
        <ScoreCircle
          score={scorecard.pronunciationScore}
          label="Pronunciation"
          icon={Mic}
          colorClass="text-emerald-500"
        />
      </div>

      {/* ── Final Assessment & Detail Sections ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Detailed Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/40 rounded-3xl border border-gray-800/60 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">
              Performance Breakdown
            </h3>
            <div className="space-y-6">
              {[
                {
                  label: "Fluency",
                  evidence: scorecard.fluencyEvidence,
                  color: "text-blue-400",
                },
                {
                  label: "Grammar",
                  evidence: scorecard.grammarEvidence,
                  color: "text-purple-400",
                },
                {
                  label: "Vocabulary",
                  evidence: scorecard.vocabularyEvidence,
                  color: "text-pink-400",
                },
                {
                  label: "Pronunciation Assessment",
                  evidence: scorecard.pronunciationEvidence,
                  color: "text-emerald-400",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-gray-800/30 rounded-2xl p-5 border border-gray-700/30 hover:border-gray-600/50 transition-colors"
                >
                  <h4
                    className={`font-bold ${item.color} mb-2 flex items-center gap-2`}
                  >
                    {item.label} Feedback
                  </h4>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {item.evidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Feedback */}
        <div className="space-y-6">
          {/* Final Summary Card */}
          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl border border-indigo-500/20 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-indigo-300 mb-4 border-b border-indigo-500/20 pb-4">
              Final Assessment
            </h3>
            <p className="text-gray-300 leading-relaxed italic text-sm">
              "{scorecard.finalAssessment}"
            </p>
          </div>

          <div className="bg-gray-900/40 rounded-3xl border border-gray-800/60 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5" />
              Key Strengths
            </h3>
            <ul className="space-y-3">
              {scorecard.strengths.map((str, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-gray-300 items-start"
                >
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-900/40 rounded-3xl border border-gray-800/60 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5" />
              Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {scorecard.areasForImprovement.map((area, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-gray-300 items-start"
                >
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span className="leading-relaxed">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
