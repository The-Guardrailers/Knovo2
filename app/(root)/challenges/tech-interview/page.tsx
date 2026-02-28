"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useConversation } from "@elevenlabs/react";
import Link from "next/link";
import dynamic from "next/dynamic";
import TestResultsPanel from "@/components/TestResultsPanel";
import InterviewScorecard from "@/components/InterviewScorecard";
import {
  DSA_PROBLEMS,
  DSAProblem,
  DifficultyConfig,
  AggressionLevel,
  HintTolerance,
  ExecutionResult,
  InterviewScorecard as ScorecardType,
} from "@/constants/interview";
import {
  getDSAInterviewerPrompt,
  getDSAFirstMessage,
} from "@/constants/interview-prompts";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Clock,
  Volume2,
  Play,
  Square,
  Code2,
  MessageSquare,
  Loader2,
  Shuffle,
  ChevronRight,
} from "lucide-react";

// Dynamically load Monaco (heavy, SSR-incompatible)
const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-900 rounded-xl">
      <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
    </div>
  ),
});

type Phase = "setup" | "interview" | "hr" | "generating" | "scorecard";

export default function TechInterviewPage() {
  // ── Phase & Config ────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedProblem, setSelectedProblem] = useState<DSAProblem>(
    DSA_PROBLEMS[0],
  );
  const [difficulty, setDifficulty] = useState<DifficultyConfig>({
    aggressionLevel: "Standard",
    hintTolerance: "Scaffolded",
  });
  const [selectedLanguage, setSelectedLanguage] = useState<
    "python" | "cpp" | "java"
  >("python");

  // ── Session State ─────────────────────────────────────────────────────
  const [code, setCode] = useState("");
  const [messages, setMessages] = useState<
    { message: string; source: string }[]
  >([]);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [scorecard, setScorecard] = useState<ScorecardType | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionStart, setSessionStart] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [agentVolume, setAgentVolume] = useState(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── ElevenLabs Conversation Hook ──────────────────────────────────────
  const conversation = useConversation({
    volume: agentVolume,
    onConnect: () => {
      console.log("[ElevenLabs] Connected");
    },
    onDisconnect: () => {
      console.log("[ElevenLabs] Disconnected");
      if (phase === "interview" || phase === "hr") {
        handleSessionEnd();
      }
    },
    onError: (error: unknown) => {
      console.error("[ElevenLabs] Error:", error);
    },
    onMessage: (msg: { message: string; source: string }) => {
      // Filter out ElevenLabs default greeting (safety net)
      const lower = msg.message?.toLowerCase() ?? "";
      if (
        lower.includes("how can i help you") ||
        lower.includes("how may i help") ||
        lower.includes("how can i assist")
      ) {
        return;
      }
      setMessages((prev) => [
        ...prev,
        { message: msg.message, source: msg.source },
      ]);
    },
  } as any);

  // ── Timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "interview" || phase === "hr") {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - sessionStart) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, sessionStart]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Helpers ───────────────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const min = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleRandomProblem = () => {
    const idx = Math.floor(Math.random() * DSA_PROBLEMS.length);
    setSelectedProblem(DSA_PROBLEMS[idx]);
  };

  // ── Start Interview ───────────────────────────────────────────────────
  const handleStartInterview = async () => {
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_TECH_INTERVIEW_AGENT_ID;
    if (!agentId) {
      alert(
        "Missing NEXT_PUBLIC_ELEVENLABS_TECH_INTERVIEW_AGENT_ID in .env.local",
      );
      return;
    }

    try {
      const starterCode =
        selectedLanguage === "cpp"
          ? selectedProblem.starterCodeCpp
          : selectedLanguage === "java"
            ? selectedProblem.starterCodeJava
            : selectedProblem.starterCode;
      setCode(starterCode);
      setMessages([]);
      setExecutionResult(null);
      setSessionStart(Date.now());
      setElapsed(0);
      setAgentVolume(0); // Mute immediately so "How can I help you" plays silently
      setPhase("interview");

      // Prevent scroll jerk when switching to interview layout
      window.scrollTo(0, 0);

      await navigator.mediaDevices.getUserMedia({ audio: true });

      const problemStatement = `${selectedProblem.title}: ${selectedProblem.statement}`;

      await conversation.startSession({
        agentId,
        dynamicVariables: {
          problemStatement,
          testCases: selectedProblem.testCasesSummary,
          aggressionLevel: difficulty.aggressionLevel,
          hintTolerance: difficulty.hintTolerance,
          promptContext: getDSAInterviewerPrompt(
            problemStatement,
            selectedProblem.constraints,
            selectedProblem.testCasesSummary,
            difficulty.aggressionLevel,
            difficulty.hintTolerance,
          ),
        },
      } as any);

      // Forcefully start the conversation loop (just like pdf-explainer)
      setTimeout(() => {
        try {
          conversation.sendContextualUpdate(
            getDSAInterviewerPrompt(
              problemStatement,
              selectedProblem.constraints,
              selectedProblem.testCasesSummary,
              difficulty.aggressionLevel,
              difficulty.hintTolerance,
            ) +
              "\n\n[CRITICAL INSTRUCTION]: Your very first response MUST be exactly this introduction: 'Welcome to your technical interview with Knovo. I will be your interviewer today. We have a coding problem to work through, followed by a few behavioral questions. Let me start by reading you the problem.' Then immediately read the full problem statement aloud. Do NOT say 'how can I help you' or any generic greeting.",
          );

          // Simulate user saying "start" to force the agent to reply
          setTimeout(() => {
            setAgentVolume(1); // Unmute right as our prompt forces the correct introduction
            conversation.sendUserMessage(
              "Please begin the interview now by reading the problem.",
            );
          }, 1500); // 1.5s additional wait (3s total) ensures default greeting finishes playing silently
        } catch (e) {
          console.warn("Could not send interview start trigger", e);
        }
      }, 1500);
    } catch (err: any) {
      console.error("Failed to start interview:", err);
      setPhase("setup");
      if (err.name === "NotAllowedError") {
        alert(
          "Microphone access is required. Please grant permission and try again.",
        );
      } else {
        alert("Failed to start interview session. Please try again.");
      }
    }
  };

  // ── Run Tests ─────────────────────────────────────────────────────────
  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch("/api/execute-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, problemId: selectedProblem.id }),
      });
      const result: ExecutionResult = await res.json();
      setExecutionResult(result);

      // Send results to the ElevenLabs agent via contextual update
      if (conversation.status === "connected") {
        const failingCases = result.results
          .filter((r) => !r.passed)
          .map(
            (r) =>
              `${r.label}: input ${r.input}, expected ${r.expectedOutput}, got ${r.actualOutput}`,
          )
          .join("; ");

        const msg =
          result.passed === result.total
            ? `[TEST RESULTS] All ${result.total} test cases passed.`
            : `[TEST RESULTS] ${result.passed} out of ${result.total} tests passed. Failing cases: ${failingCases}`;

        conversation.sendContextualUpdate(msg);
      }
    } catch (err) {
      console.error("Test execution error:", err);
    } finally {
      setIsRunningTests(false);
    }
  };

  // ── End Session ───────────────────────────────────────────────────────
  const handleEndSession = async () => {
    // Stop the timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      await conversation.endSession();
    } catch (err) {
      console.error("Error ending session:", err);
    }
    // Reset to setup phase
    setPhase("setup");
    setMessages([]);
    setExecutionResult(null);
    setElapsed(0);
    setScorecard(null);
  };

  const handleSessionEnd = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("generating");

    // Generate scorecard via Gemini
    try {
      const transcript = messages
        .map(
          (m) =>
            `${m.source === "user" ? "Candidate" : "Interviewer"}: ${m.message}`,
        )
        .join("\n");

      const testSummary = executionResult
        ? `Tests: ${executionResult.passed}/${executionResult.total} passed`
        : "No tests were run";

      const res = await fetch("/api/generate-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          testSummary,
          problemTitle: selectedProblem.title,
          code,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setScorecard(data.scorecard);
        setPhase("scorecard");
      } else {
        console.error("Scorecard generation failed");
        setPhase("scorecard");
      }
    } catch (err) {
      console.error("Error generating scorecard:", err);
      setPhase("scorecard");
    }
  }, [messages, executionResult, selectedProblem, code]);

  // ── Mic Toggle ────────────────────────────────────────────────────────
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Note: ElevenLabs SDK handles audio tracks internally
  };

  // ── Status Display ────────────────────────────────────────────────────
  const getStatusDisplay = () => {
    if (conversation.status === "connecting")
      return { text: "Connecting…", color: "text-yellow-400" };
    if (conversation.status === "connected") {
      if (conversation.isSpeaking)
        return { text: "Interviewer speaking…", color: "text-emerald-400" };
      return { text: "Listening", color: "text-blue-400" };
    }
    return { text: "Disconnected", color: "text-gray-400" };
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════

  // ── Setup Phase ───────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-8 md:p-10">
        {/* Back Link */}
        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Challenges
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 sm:p-12 text-center mb-10 border border-purple-500/30">
          <div className="flex items-center justify-center gap-4 mb-5">
            <Code2 className="w-10 h-10 text-white" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
              Technical Interview
            </h1>
          </div>
          <p className="text-purple-100 text-lg sm:text-xl max-w-3xl mx-auto">
            Voice-based DSA coding interview with live code execution, followed
            by an HR behavioral round. Powered by AI.
          </p>
        </div>

        {/* Problem Selection */}
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Select Problem</h2>
            <button
              onClick={handleRandomProblem}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-300 hover:bg-purple-500/30 transition-all"
            >
              <Shuffle className="w-4 h-4" />
              Random
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DSA_PROBLEMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProblem(p)}
                className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  selectedProblem.id === p.id
                    ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                    : "border-gray-700/50 bg-gray-900/50 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white text-base">
                    {p.title}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                      p.difficulty === "easy"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : p.difficulty === "medium"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {p.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {p.statement}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Config */}
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-8 mb-10">
          <h2 className="text-xl font-bold text-white mb-6">
            Difficulty Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Aggression */}
            <div>
              <label className="text-base font-medium text-gray-300 mb-3 block">
                Follow-up Aggression
              </label>
              <div className="flex gap-3">
                {(["Light", "Standard", "Aggressive"] as AggressionLevel[]).map(
                  (level) => (
                    <button
                      key={level}
                      onClick={() =>
                        setDifficulty((d) => ({ ...d, aggressionLevel: level }))
                      }
                      className={`flex-1 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                        difficulty.aggressionLevel === level
                          ? "bg-purple-600 text-white border border-purple-500"
                          : "bg-gray-900/50 text-gray-400 border border-gray-700/50 hover:border-gray-600"
                      }`}
                    >
                      {level}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Hints */}
            <div>
              <label className="text-base font-medium text-gray-300 mb-3 block">
                Hint Tolerance
              </label>
              <div className="flex gap-3">
                {(["None", "Scaffolded"] as HintTolerance[]).map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      setDifficulty((d) => ({ ...d, hintTolerance: level }))
                    }
                    className={`flex-1 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                      difficulty.hintTolerance === level
                        ? "bg-purple-600 text-white border border-purple-500"
                        : "bg-gray-900/50 text-gray-400 border border-gray-700/50 hover:border-gray-600"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartInterview}
          className="w-full flex items-center justify-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xl hover:from-purple-700 hover:to-indigo-700 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02]"
        >
          Start Interview
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    );
  }

  // ── Generating Scorecard Phase ────────────────────────────────────────
  if (phase === "generating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
          </div>
          <div
            className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-ping"
            style={{ animationDuration: "2s" }}
          />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Generating Your Scorecard
          </h2>
          <p className="text-gray-400">
            Analyzing your interview performance across all dimensions…
          </p>
        </div>
      </div>
    );
  }

  // ── Scorecard Phase ───────────────────────────────────────────────────
  if (phase === "scorecard") {
    if (scorecard) {
      return (
        <div className="p-4 sm:p-6 md:p-8">
          <InterviewScorecard
            scorecard={scorecard}
            problemTitle={selectedProblem.title}
            duration={elapsed}
          />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Interview Complete
          </h2>
          <p className="text-gray-400 mb-6">
            Your session has ended. Scorecard generation is unavailable at the
            moment.
          </p>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  // ── Interview & HR Phase (Main 3-Panel Layout) ────────────────────────
  const statusDisplay = getStatusDisplay();

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] bg-gray-950 rounded-2xl overflow-hidden border border-gray-800/60">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/90 border-b border-gray-700/50 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-white">
            {selectedProblem.title}
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
              selectedProblem.difficulty === "easy"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                : selectedProblem.difficulty === "medium"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/20"
                  : "bg-red-500/20 text-red-300 border border-red-500/20"
            }`}
          >
            {selectedProblem.difficulty}
          </span>
          {phase === "hr" && (
            <span className="text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
              HR ROUND
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-700/40">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="font-mono text-lg font-bold text-red-400">
              {formatTime(elapsed)}
            </span>
          </div>

          {/* Status */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border ${
              conversation.status === "connected"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-gray-700/50 border-gray-600/30"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                conversation.status === "connected"
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-gray-500"
              }`}
            />
            <span className={statusDisplay.color}>{statusDisplay.text}</span>
          </div>

          {/* End Session */}
          <button
            onClick={handleEndSession}
            className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 hover:shadow-red-900/30"
          >
            END SESSION
          </button>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Voice Console / Transcript */}
        <div className="w-72 sm:w-80 lg:w-96 flex flex-col border-r border-gray-700/50 shrink-0 bg-gray-900/30">
          {/* Voice orb */}
          <div className="p-5 flex flex-col items-center border-b border-gray-700/50 shrink-0">
            <div className="relative mb-3">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  conversation.isSpeaking
                    ? "bg-gradient-to-tr from-purple-500 to-blue-400 shadow-[0_0_40px_rgba(168,85,247,0.5)] scale-110"
                    : conversation.status === "connected"
                      ? "bg-gradient-to-tr from-purple-500/30 to-blue-400/30 border border-purple-500/20"
                      : "bg-gray-800 border-2 border-gray-700"
                }`}
              >
                <Volume2
                  className={`w-9 h-9 text-white ${
                    conversation.isSpeaking ? "animate-pulse" : "opacity-40"
                  }`}
                />
              </div>
              {conversation.isSpeaking && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-ping"
                    style={{ animationDuration: "2s" }}
                  />
                  <div
                    className="absolute inset-[-8px] rounded-full border border-purple-400/15 animate-ping"
                    style={{ animationDuration: "3s", animationDelay: "0.5s" }}
                  />
                </>
              )}
            </div>
            <span className={`text-sm font-semibold ${statusDisplay.color}`}>
              {statusDisplay.text}
            </span>
          </div>

          {/* Transcript */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(139,92,246,0.3) transparent",
            }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-40">
                <MessageSquare className="w-10 h-10 text-gray-500 mb-3" />
                <p className="text-sm text-gray-500">
                  Conversation will appear here
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.source === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-[10px] text-gray-500 mb-1 px-1 uppercase tracking-wider font-semibold">
                    {msg.source === "user" ? "You" : "AI Interviewer"}
                  </span>
                  <div
                    className={`px-4 py-3 rounded-xl max-w-[95%] text-sm leading-relaxed ${
                      msg.source === "user"
                        ? "bg-blue-600/15 text-blue-100 border border-blue-500/20 rounded-br-none"
                        : "bg-purple-600/15 text-purple-100 border border-purple-500/20 rounded-bl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>

        {/* CENTER: Code Editor (interview only) / Full transcript (HR) */}
        {phase === "interview" ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Language selector */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border-b border-gray-800 shrink-0">
              {(["python", "cpp", "java"] as const).map((lang) => {
                const labels: Record<string, string> = {
                  python: "Python 3.10",
                  cpp: "C++ 17",
                  java: "Java 17",
                };
                const colors: Record<string, string> = {
                  python: "bg-yellow-500",
                  cpp: "bg-blue-500",
                  java: "bg-orange-500",
                };
                return (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLanguage(lang);
                      const code =
                        lang === "cpp"
                          ? selectedProblem.starterCodeCpp
                          : lang === "java"
                            ? selectedProblem.starterCodeJava
                            : selectedProblem.starterCode;
                      setCode(code);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      selectedLanguage === lang
                        ? "bg-gray-700 text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${colors[lang]}`}
                    />
                    {labels[lang]}
                  </button>
                );
              })}
            </div>
            {/* Editor */}
            <div className="flex-1">
              <CodeEditor
                code={code}
                onChange={setCode}
                language={
                  selectedLanguage === "cpp"
                    ? "cpp"
                    : selectedLanguage === "java"
                      ? "java"
                      : "python"
                }
              />
            </div>
          </div>
        ) : (
          /* HR Round: expanded transcript area */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="relative mb-8">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                  conversation.isSpeaking
                    ? "bg-gradient-to-tr from-purple-500 to-indigo-400 shadow-[0_0_60px_rgba(168,85,247,0.5)] scale-110"
                    : "bg-gradient-to-tr from-purple-500/20 to-indigo-400/20"
                }`}
              >
                <Volume2
                  className={`w-16 h-16 text-white ${
                    conversation.isSpeaking ? "animate-pulse" : "opacity-30"
                  }`}
                />
              </div>
              {conversation.isSpeaking && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border-2 border-purple-400/20 animate-ping"
                    style={{ animationDuration: "2s" }}
                  />
                  <div
                    className="absolute inset-[-20px] rounded-full border border-indigo-400/10 animate-ping"
                    style={{ animationDuration: "3s", animationDelay: "0.5s" }}
                  />
                </>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Behavioral Interview Round
            </h2>
            <p className="text-gray-400 text-sm">
              The interviewer is asking behavioral questions. Speak naturally.
            </p>
          </div>
        )}

        {/* RIGHT: Test Results (interview only) */}
        {phase === "interview" && (
          <div className="w-64 lg:w-72 xl:w-80 shrink-0 border-l border-gray-700/50">
            <TestResultsPanel
              problem={selectedProblem}
              executionResult={executionResult}
              isRunning={isRunningTests}
              onRunTests={handleRunTests}
            />
          </div>
        )}
      </div>

      {/* ── Bottom Bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/90 border-t border-gray-700/50 shrink-0">
        <div className="flex items-center gap-4">
          {/* Mic toggle */}
          <button
            onClick={toggleMute}
            className={`p-2.5 rounded-full transition-all ${
              isMuted
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          <span className="text-sm text-gray-400">
            {isMuted
              ? "Microphone muted"
              : "Microphone active — speak to the interviewer"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/30">
            {difficulty.aggressionLevel} · {difficulty.hintTolerance}
          </span>
        </div>
      </div>
    </div>
  );
}
