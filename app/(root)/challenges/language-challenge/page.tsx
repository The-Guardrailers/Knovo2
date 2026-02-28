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
import LanguageScorecardComponent from "@/components/LanguageScorecard";
import {
  LANGUAGE_SCENARIOS,
  LanguageScenario,
  LanguageDifficultyConfig,
  StrictnessLevel,
  PacingLevel,
  LanguageScorecard as ScorecardType,
} from "@/constants/language";
import {
  getLanguageAssessorPrompt,
  getLanguageFirstMessage,
} from "@/constants/language-prompts";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Clock,
  Volume2,
  MessageSquare,
  Loader2,
  Shuffle,
  ChevronRight,
  Globe2,
} from "lucide-react";

type Phase = "setup" | "roleplay" | "generating" | "scorecard";

export default function LanguageChallengePage() {
  // ── Phase & Config ────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("setup");
  const [targetLanguage, setTargetLanguage] = useState<string>("English");
  const [selectedScenario, setSelectedScenario] = useState<LanguageScenario>(
    LANGUAGE_SCENARIOS[0],
  );
  const [difficulty, setDifficulty] = useState<LanguageDifficultyConfig>({
    strictnessLevel: "Moderate",
    pacingLevel: "Normal",
  });

  // ── Session State ─────────────────────────────────────────────────────
  const [messages, setMessages] = useState<
    { message: string; source: string }[]
  >([]);
  const [scorecard, setScorecard] = useState<ScorecardType | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionStart, setSessionStart] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [agentVolume, setAgentVolume] = useState(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSessionEnd = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("generating");

    try {
      const transcript = messages
        .map(
          (m) => `${m.source === "user" ? "User" : "Assessor"}: ${m.message}`,
        )
        .join("\n");

      const res = await fetch("/api/generate-language-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          scenarioTitle: selectedScenario.title,
          scenarioObjective: selectedScenario.objective,
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
  }, [messages, selectedScenario]);

  // ── ElevenLabs Conversation Hook ──────────────────────────────────────
  const conversation = useConversation({
    volume: agentVolume,
    onConnect: () => {
      console.log("[ElevenLabs] Connected");
    },
    onDisconnect: () => {
      console.log("[ElevenLabs] Disconnected");
      if (phase === "roleplay") {
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
    if (phase === "roleplay") {
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

  const handleRandomScenario = () => {
    const idx = Math.floor(Math.random() * LANGUAGE_SCENARIOS.length);
    setSelectedScenario(LANGUAGE_SCENARIOS[idx]);
  };

  // ── Start Roleplay ───────────────────────────────────────────────────
  const handleStartRoleplay = async () => {
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_LANGUAGE_AGENT_ID;
    if (!agentId) {
      alert("Missing NEXT_PUBLIC_ELEVENLABS_LANGUAGE_AGENT_ID in .env.local");
      return;
    }

    try {
      setMessages([]);
      setSessionStart(Date.now());
      setElapsed(0);
      setAgentVolume(0); // Mute immediately to hide default greeting
      setPhase("roleplay");

      window.scrollTo(0, 0);
      await navigator.mediaDevices.getUserMedia({ audio: true });

      await conversation.startSession({
        agentId,
        dynamicVariables: {
          scenarioContext: selectedScenario.context,
          scenarioObjective: selectedScenario.objective,
          keyVocabulary: selectedScenario.keyVocabulary.join(", "),
          strictnessLevel: difficulty.strictnessLevel,
          pacingLevel: difficulty.pacingLevel,
          targetLanguage: targetLanguage,
          promptContext: getLanguageAssessorPrompt(
            selectedScenario.context,
            selectedScenario.objective,
            selectedScenario.keyVocabulary.join(", "),
            difficulty.strictnessLevel,
            difficulty.pacingLevel,
            targetLanguage,
          ),
        },
      } as any);

      // Force correctly scoped intro
      setTimeout(() => {
        try {
          conversation.sendContextualUpdate(
            getLanguageAssessorPrompt(
              selectedScenario.context,
              selectedScenario.objective,
              selectedScenario.keyVocabulary.join(", "),
              difficulty.strictnessLevel,
              difficulty.pacingLevel,
              targetLanguage,
            ) +
              `\n\n[CRITICAL INSTRUCTION]: Your very first response MUST be exactly this introduction in ${targetLanguage}: '${getLanguageFirstMessage(selectedScenario.title)}' Do NOT say 'how can I help you' or any generic greeting.`,
          );

          // Simulate user saying "start" to force the agent to reply
          setTimeout(() => {
            setAgentVolume(1); // Unmute right as our trigger prompts the intro
            conversation.sendUserMessage("I am ready to start the roleplay.");
          }, 1500);
        } catch (e) {
          console.warn("Could not send roleplay start trigger", e);
        }
      }, 1500);
    } catch (err: any) {
      console.error("Failed to start roleplay:", err);
      setPhase("setup");
      if (err.name === "NotAllowedError") {
        alert(
          "Microphone access is required. Please grant permission and try again.",
        );
      } else {
        alert("Failed to start roleplay session. Please try again.");
      }
    }
  };

  // ── End Session ───────────────────────────────────────────────────────
  const handleEndSession = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      await conversation.endSession();
    } catch (err) {
      console.error("Error ending session:", err);
    }
    setPhase("setup");
    setMessages([]);
    setElapsed(0);
    setScorecard(null);
  };

  // ── Status Display ────────────────────────────────────────────────────
  const getStatusDisplay = () => {
    if (conversation.status === "connecting")
      return { text: "Connecting…", color: "text-yellow-400" };
    if (conversation.status === "connected") {
      if (conversation.isSpeaking)
        return { text: "Partner speaking…", color: "text-emerald-400" };
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
        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Challenges
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 rounded-2xl p-8 sm:p-12 text-center mb-10 border border-blue-500/30 shadow-xl shadow-blue-900/20">
          <div className="flex items-center justify-center gap-4 mb-5">
            <Globe2 className="w-10 h-10 text-white" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
              Language Challenge
            </h1>
          </div>
          <p className="text-blue-100 text-lg sm:text-xl max-w-3xl mx-auto">
            Immersive voice-based roleplay to enhance your speaking, fluency,
            and vocabulary in real-world scenarios.
          </p>
        </div>

        {/* Scenario Selection */}
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Select Scenario</h2>
            <button
              onClick={handleRandomScenario}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-300 hover:bg-blue-500/30 transition-all"
            >
              <Shuffle className="w-4 h-4" />
              Random
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LANGUAGE_SCENARIOS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedScenario(p)}
                className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  selectedScenario.id === p.id
                    ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
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
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                  {p.context}
                </p>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {p.keyVocabulary.slice(0, 3).map((vocab, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700"
                    >
                      {vocab}
                    </span>
                  ))}
                  {p.keyVocabulary.length > 3 && (
                    <span className="text-[10px] text-gray-500 px-1 py-0.5">
                      +{p.keyVocabulary.length - 3}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Config */}
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-8 mb-10">
          <h2 className="text-xl font-bold text-white mb-6">
            Roleplay Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Target Language */}
            <div>
              <label className="text-base font-medium text-gray-300 mb-3 block">
                Target Language
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 text-white rounded-lg border border-gray-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium appearance-none outline-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                  backgroundSize: "1.2em 1.2em",
                }}
              >
                {[
                  "English",
                  "Spanish",
                  "French",
                  "German",
                  "Italian",
                  "Portuguese",
                  "Japanese",
                  "Korean",
                  "Mandarin",
                  "Arabic",
                  "Hindi",
                  "Russian",
                  "Dutch",
                  "Swedish",
                ].map((lang) => (
                  <option
                    key={lang}
                    value={lang}
                    className="bg-gray-900 text-white"
                  >
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            {/* Strictness */}
            <div>
              <label className="text-base font-medium text-gray-300 mb-3 block">
                Assessor Strictness
              </label>
              <div className="flex gap-3">
                {(["Lenient", "Moderate", "Strict"] as StrictnessLevel[]).map(
                  (level) => (
                    <button
                      key={level}
                      onClick={() =>
                        setDifficulty((d) => ({ ...d, strictnessLevel: level }))
                      }
                      className={`flex-1 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                        difficulty.strictnessLevel === level
                          ? "bg-blue-600 text-white border border-blue-500"
                          : "bg-gray-900/50 text-gray-400 border border-gray-700/50 hover:border-gray-600"
                      }`}
                    >
                      {level}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Pacing */}
            <div>
              <label className="text-base font-medium text-gray-300 mb-3 block">
                Conversation Pacing
              </label>
              <div className="flex gap-3">
                {(["Slow", "Normal", "Fast"] as PacingLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      setDifficulty((d) => ({ ...d, pacingLevel: level }))
                    }
                    className={`flex-1 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                      difficulty.pacingLevel === level
                        ? "bg-blue-600 text-white border border-blue-500"
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
          onClick={handleStartRoleplay}
          className="w-full flex items-center justify-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02]"
        >
          Start Challenge
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    );
  }

  // ── Generating Phase ──────────────────────────────────────────────────
  if (phase === "generating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
          </div>
          <div
            className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping"
            style={{ animationDuration: "2s" }}
          />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Analyzing Fluency
          </h2>
          <p className="text-gray-400">Generating your language scorecard…</p>
        </div>
      </div>
    );
  }

  // ── Scorecard Phase ───────────────────────────────────────────────────
  if (phase === "scorecard") {
    if (scorecard) {
      return (
        <div className="p-4 sm:p-6 md:p-8">
          <LanguageScorecardComponent
            scorecard={scorecard}
            scenarioTitle={selectedScenario.title}
            duration={elapsed}
          />
          <div className="max-w-6xl mx-auto mt-8 flex justify-center">
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all border border-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Challenges
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Roleplay Complete
          </h2>
          <p className="text-gray-400 mb-6">
            Session ended. Scorecard generation failed.
          </p>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  // ── Roleplay Phase ────────────────────────────────────────────────────
  const statusDisplay = getStatusDisplay();

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] bg-gray-950 rounded-2xl overflow-hidden border border-gray-800/60 w-full max-w-7xl mx-auto my-4 shadow-2xl">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/90 border-b border-gray-700/50 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-white">
            {selectedScenario.title}
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
              selectedScenario.difficulty === "easy"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                : selectedScenario.difficulty === "medium"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/20"
                  : "bg-red-500/20 text-red-300 border border-red-500/20"
            }`}
          >
            {selectedScenario.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-700/40">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="font-mono text-lg font-bold text-red-400">
              {formatTime(elapsed)}
            </span>
          </div>

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

          <button
            onClick={handleEndSession}
            className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 hover:shadow-red-900/30"
          >
            END SESSION
          </button>
        </div>
      </div>

      {/* ── Main Layout ────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Orb and Objectives */}
        <div className="w-80 sm:w-96 flex flex-col border-r border-gray-700/50 shrink-0 bg-gray-900/50">
          <div className="flex-1 flex flex-col justify-center items-center p-8 border-b border-gray-700/50">
            <div className="relative mb-6">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                  conversation.isSpeaking
                    ? "bg-gradient-to-tr from-blue-500 to-indigo-400 shadow-[0_0_60px_rgba(59,130,246,0.5)] scale-110"
                    : "bg-gradient-to-tr from-blue-500/20 to-indigo-400/20"
                }`}
              >
                <Globe2
                  className={`w-16 h-16 text-white ${
                    conversation.isSpeaking ? "animate-pulse" : "opacity-30"
                  }`}
                />
              </div>
              {conversation.isSpeaking && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border-2 border-blue-400/20 animate-ping"
                    style={{ animationDuration: "2s" }}
                  />
                  <div
                    className="absolute inset-[-20px] rounded-full border border-indigo-400/10 animate-ping"
                    style={{ animationDuration: "3s", animationDelay: "0.5s" }}
                  />
                </>
              )}
            </div>
            <h2 className="text-xl font-bold text-white mb-2 text-center">
              {selectedScenario.title}
            </h2>
            <p className="text-gray-400 text-sm text-center">
              Speak naturally to complete the objective.
            </p>
          </div>

          <div className="p-6 bg-gray-900">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-3">
              Objective
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {selectedScenario.objective}
            </p>

            <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-3">
              Key Vocabulary
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedScenario.keyVocabulary.map((word, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-800 text-blue-300 rounded border border-gray-700 text-xs"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Live Transcript */}
        <div className="flex-1 flex flex-col bg-gray-950 relative overflow-hidden">
          {/* Transcript Scroll Area */}
          <div
            className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(59,130,246,0.3) transparent",
            }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-40">
                <MessageSquare className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-lg text-gray-400 font-medium">
                  Listening for conversation...
                </p>
                <p className="text-sm text-gray-500 mt-2 max-w-sm">
                  The language assessor is ready. Begin speaking to start the
                  roleplay.
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
                  <span className="text-xs text-gray-500 mb-1.5 px-1 uppercase tracking-wider font-semibold">
                    {msg.source === "user" ? "You" : "Language Assessor"}
                  </span>
                  <div
                    className={`px-5 py-4 rounded-2xl max-w-[85%] text-base leading-relaxed ${
                      msg.source === "user"
                        ? "bg-blue-600 border border-blue-500 text-white rounded-br-none shadow-xl shadow-blue-900/20"
                        : "bg-gray-800 border border-gray-700 text-gray-100 rounded-bl-none shadow-xl shadow-black/20"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Input Indicator */}
          <div className="p-4 bg-gray-900/80 backdrop-blur-md border-t border-gray-800 shrink-0 flex justify-center items-center">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${conversation.status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-gray-600"}`}
              ></div>
              <span className="text-gray-400 text-sm font-medium">
                {conversation.isSpeaking
                  ? "Assessor is speaking..."
                  : conversation.status === "connected"
                    ? "Listening..."
                    : "Microphone disabled"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
