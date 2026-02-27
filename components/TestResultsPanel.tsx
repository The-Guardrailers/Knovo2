"use client";

import React from "react";
import { TestResult, ExecutionResult, DSAProblem } from "@/constants/interview";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
} from "lucide-react";

interface TestResultsPanelProps {
  problem: DSAProblem;
  executionResult: ExecutionResult | null;
  isRunning: boolean;
  onRunTests: () => void;
}

export default function TestResultsPanel({
  problem,
  executionResult,
  isRunning,
  onRunTests,
}: TestResultsPanelProps) {
  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* Problem Statement */}
      <div className="p-4 border-b border-gray-700/50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">{problem.title}</h3>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              problem.difficulty === "easy"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : problem.difficulty === "medium"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
            }`}
          >
            {problem.difficulty}
          </span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          {problem.statement}
        </p>
        <p className="text-xs text-gray-500 mt-2 font-mono">
          {problem.constraints}
        </p>
      </div>

      {/* Test Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Summary bar */}
        {executionResult && (
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border ${
              executionResult.passed === executionResult.total
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <span className="text-sm font-bold text-white">
              TESTS: {executionResult.passed}/{executionResult.total}
            </span>
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  executionResult.passed === executionResult.total
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-emerald-500 to-red-500"
                }`}
                style={{
                  width: `${(executionResult.passed / executionResult.total) * 100}%`,
                }}
              />
            </div>
            {executionResult.passed < executionResult.total && (
              <span className="text-xs font-semibold text-red-400">
                {executionResult.total - executionResult.passed} FAILING
              </span>
            )}
          </div>
        )}

        {/* Individual test cases */}
        {executionResult?.results.map((result, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border ${
              result.passed
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {result.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : result.error?.includes("Time") ? (
                  <Clock className="w-4 h-4 text-amber-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm font-medium text-white">
                  {result.label}
                </span>
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  result.caseType === "basic"
                    ? "bg-blue-500/20 text-blue-300"
                    : result.caseType === "edge"
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-orange-500/20 text-orange-300"
                }`}
              >
                {result.caseType}
              </span>
            </div>

            {!result.passed && (
              <div className="mt-2 space-y-1 text-xs font-mono">
                <div className="text-gray-400">
                  <span className="text-gray-500">in </span>
                  {result.input}
                </div>
                <div className="text-emerald-400">
                  <span className="text-gray-500">exp </span>
                  {result.expectedOutput}
                </div>
                <div className="text-red-400">
                  <span className="text-gray-500">got </span>
                  {result.actualOutput}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Empty state */}
        {!executionResult && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-50">
            <AlertTriangle className="w-10 h-10 text-gray-500 mb-3" />
            <p className="text-sm text-gray-400">No test results yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Click &quot;Run Tests&quot; to execute your code
            </p>
          </div>
        )}
      </div>

      {/* Run Tests Button */}
      <div className="p-4 border-t border-gray-700/50 shrink-0">
        <button
          onClick={onRunTests}
          disabled={isRunning}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            isRunning
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-500/25"
          }`}
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              RUN TESTS
            </>
          )}
        </button>
      </div>
    </div>
  );
}
