"use client";

import React, { useEffect, useRef, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import Link from "next/link";
import {
  Zap,
  Code2,
  ArrowRight,
  MessageSquare,
  Mic,
  Brain,
} from "lucide-react";

type ChallengeMode = "select" | "miscellaneous";

export default function ChallengesPage() {
  const [mode, setMode] = useState<ChallengeMode>("select");

  // ═══════════════════════════════════════════════════════════════════════
  //  Miscellaneous Challenge (existing VAPI logic — preserved as-is)
  // ═══════════════════════════════════════════════════════════════════════
  const workflowId = process.env.NEXT_PUBLIC_VAPI_MISCELLANEOUS_ID!;
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<
    { id: string; role?: string; text: string }[]
  >([]);
  const msgIdRef = useRef(0);

  useEffect(() => {
    const onCallStart = () => {
      setRunning(true);
      console.log("[vapi] call-start");
    };
    const onCallEnd = () => {
      setRunning(false);
      console.log("[vapi] call-end");
    };
    const onMessage = (msg: any) => {
      const text =
        msg?.type === "transcript"
          ? msg.transcript
          : (msg?.text ?? msg?.content ?? "");

      const role = msg?.role ?? msg?.from ?? "assistant";

      if (!text) return;
      if (
        msg?.type === "transcript" &&
        msg?.transcriptType &&
        msg.transcriptType !== "final"
      ) {
        return;
      }

      const id = `m-${++msgIdRef.current}-${Date.now()}`;
      setMessages((prev) => [...prev, { id, role, text }]);
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (err: any) => console.error("[vapi] error", err);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  const handleStart = async () => {
    if (!workflowId) {
      alert("Missing NEXT_PUBLIC_VAPI_MISCELLANEOUS_ID in .env.local");
      return;
    }
    setStarting(true);
    setMessages([]);
    try {
      const variableValues = { userName: "Player", userId: null };
      await vapi.start(undefined, undefined, undefined, workflowId, {
        variableValues,
      });
    } catch (err: any) {
      console.error("Failed to start workflow", err);
      alert("Failed to start workflow. See console.");
    } finally {
      setStarting(false);
    }
  };

  const handleStop = () => {
    try {
      vapi.stop();
    } catch (err) {
      console.error("Failed to stop workflow", err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════

  // ── Mode Selection ────────────────────────────────────────────────────
  if (mode === "select") {
    return (
      <div className="w-full p-4 sm:p-6 md:p-8 min-h-fit">
        {/* Back to Dashboard */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </Link>

        {/* ── Hero Header ──────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-8 sm:p-12 md:p-16 text-center mb-6 sm:mb-8 shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e3a5f 75%, #0f172a 100%)",
          }}
        >
          {/* Animated glow orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] animate-pulse"
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
            {/* Top label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest">
                Premium Feature
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-300 bg-clip-text text-transparent">
                Challenge Modes
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300/90 leading-relaxed max-w-2xl mx-auto font-light">
              Push your limits — test knowledge with voice quizzes or ace a full
              AI-driven technical interview with live coding.
            </p>

            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 backdrop-blur-sm">
                <Brain className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">
                  AI Powered
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-sm">
                <Mic className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-blue-300">
                  Voice-driven
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/20 backdrop-blur-sm">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300">
                  Live Coding
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-400/20 backdrop-blur-sm">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-300">
                  Real-time
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Challenge Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Miscellaneous Challenge */}
          <button
            onClick={() => setMode("miscellaneous")}
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
                  <Zap className="w-7 h-7 text-cyan-400 fill-current" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-200 transition-colors duration-300">
                    Miscellaneous Challenge
                  </h2>
                  <span className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-semibold">
                    Voice Quiz
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Random topic, any format — test your knowledge, vocal and
                expressive abilities. Adaptive difficulty that evolves with your
                performance in real-time.
              </p>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/15 text-[11px] font-medium text-cyan-300">
                  <Mic className="w-3 h-3" /> Voice Interaction
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/15 text-[11px] font-medium text-teal-300">
                  <Zap className="w-3 h-3" /> Adaptive
                </span>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-end pt-4 border-t border-gray-700/50">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
            </div>
          </button>

          {/* Technical Interview Challenge */}
          <Link
            href="/challenges/tech-interview"
            className="group relative text-left overflow-hidden rounded-2xl border border-gray-700/60 p-6 sm:p-8 transition-all duration-500 hover:border-purple-500/60 hover:shadow-[0_0_40px_rgba(168,85,247,0.12)]"
            style={{
              background:
                "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.9) 100%)",
            }}
          >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-indigo-500/0 group-hover:from-purple-500/5 group-hover:to-indigo-500/5 transition-all duration-500" />
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full group-hover:bg-purple-500/10 transition-all duration-500" />
            {/* NEW badge */}
            <div className="absolute top-4 right-4 z-20">
              <span className="relative flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg shadow-purple-500/30">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                New
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                  <Code2 className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                    Technical Interview
                  </h2>
                  <span className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-semibold">
                    DSA + Live Coding + HR
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Full interview simulation — AI interviewer probes your
                reasoning, you code live in Python, and then face behavioral
                questions. Get a detailed 4-dimension scorecard.
              </p>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/15 text-[11px] font-medium text-purple-300">
                  <Code2 className="w-3 h-3" /> Live Coding
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/15 text-[11px] font-medium text-blue-300">
                  <Mic className="w-3 h-3" /> Voice Interview
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/15 text-[11px] font-medium text-emerald-300">
                  <Brain className="w-3 h-3" /> HR Round
                </span>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-end pt-4 border-t border-gray-700/50">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                </div>
              </div>
            </div>
          </Link>

          {/* Language Challenge */}
          <Link
            href="/challenges/language-challenge"
            className="group relative text-left overflow-hidden rounded-2xl border border-gray-700/60 p-6 sm:p-8 transition-all duration-500 hover:border-blue-500/60 hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]"
            style={{
              background:
                "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.9) 100%)",
            }}
          >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-500" />
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-all duration-500" />

            {/* NEW badge */}
            <div className="absolute top-4 right-4 z-20">
              <span className="relative flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg shadow-blue-500/30">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                New
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                  <MessageSquare className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                    Language Challenge
                  </h2>
                  <span className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-semibold">
                    Roleplay + Evaluation
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Master any language through complete voice-driven roleplay
                scenarios. Get evaluated on fluency, grammar, vocabulary, and
                pronunciation.
              </p>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/15 text-[11px] font-medium text-blue-300">
                  <MessageSquare className="w-3 h-3" /> Immersive Roleplay
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/15 text-[11px] font-medium text-emerald-300">
                  <Brain className="w-3 h-3" /> Detailed Scoring
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/15 text-[11px] font-medium text-cyan-300">
                  <Mic className="w-3 h-3" /> AI Voice
                </span>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-end pt-4 border-t border-gray-700/50">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // ── Miscellaneous Challenge Mode (original UI — preserved) ────────────
  return (
    <div className="w-full mx-auto p-4 sm:p-6 md:p-8 min-h-fit">
      {/* Back to mode selection */}
      <button
        onClick={() => setMode("select")}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        Back to Challenge Selection
      </button>

      {/* Enhanced Call Section */}
      <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl border-2 border-gray-600/50 shadow-2xl p-6 sm:p-10 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-8">
          <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
            <div className="relative shrink-0">
              <Zap className="w-15 h-15 text-white relative z-10 group-hover:scale-110 transition-transform duration-300 fill-current" />
              {running && (
                <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-900 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-1.5 sm:mb-2">
                Miscellaneous Challenge
              </h2>
              <div className="flex items-center gap-3 sm:gap-4 mt-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    running
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-gray-600/20 text-gray-400 border border-gray-600/30"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${running ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`}
                  ></div>
                  {running ? "Active" : "Standby"}
                </div>
                {isSpeaking && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    Listening
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 sm:gap-4">
            <button
              className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 transform ${
                starting || running
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 text-gray-100 hover:from-cyan-700 hover:to-blue-700 hover:scale-105 shadow-lg hover:shadow-xl"
              }`}
              onClick={handleStart}
              disabled={starting || running}
            >
              {starting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  Starting…
                </div>
              ) : running ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  Running
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Call
                </div>
              )}
            </button>
            <button
              className={`px-6 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 border-2 ${
                !running
                  ? "border-gray-600 text-gray-500 cursor-not-allowed"
                  : "border-red-500 text-red-400 hover:bg-red-500/10 hover:scale-105"
              }`}
              onClick={handleStop}
              disabled={!running}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 21V8a5 5 0 015-5l6 6 5-5"
                  />
                </svg>
                End
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl border-2 border-gray-600/50 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-100">
                Live Transcript
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {isSpeaking && (
                <>
                  <div className="flex items-center gap-2 bg-emerald-500/20 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-500/30">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-ping"></div>
                    <span className="text-emerald-300 text-xs sm:text-sm font-medium">
                      Listening
                    </span>
                  </div>
                  <div className="hidden sm:flex gap-1">
                    <div className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                    <div
                      className="w-1 h-6 bg-emerald-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-1 h-5 bg-emerald-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.3s" }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="bg-gray-900 rounded-xl border border-gray-600/30 p-4 sm:p-6 min-h-[220px] sm:min-h-[280px] md:min-h-[300px] max-h-[45vh] sm:max-h-[460px] overflow-auto shadow-inner">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <svg
                    className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                <p className="text-gray-400 text-base sm:text-lg">
                  No transcripts yet
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">
                  Start a call to see live transcription
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 sm:p-4 rounded-xl ${
                      m.role === "user"
                        ? "bg-blue-500/10 border-l-4 border-blue-500 ml-3 sm:ml-8"
                        : "bg-purple-500/10 border-l-4 border-purple-500 mr-3 sm:mr-8"
                    }`}
                  >
                    <div
                      className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide mb-1.5 sm:mb-2 ${
                        m.role === "user" ? "text-blue-400" : "text-purple-400"
                      }`}
                    >
                      {m.role === "user" ? "👤 You" : "🤖 Assistant"}
                    </div>
                    <div className="text-gray-200 leading-relaxed text-sm sm:text-base">
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
