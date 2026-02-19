"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { vapi } from "@/lib/vapi.sdk";
import {
  Star, Sparkles, Trophy, Zap, Play, ArrowRight, Mic, MicOff, Brain,
  BookOpen, Lightbulb, Target, Award, Rocket, ChevronDown, MessageSquare,
  BarChart3, Users, FileText, Bot, Headphones, RefreshCw, Shield
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Knovo Avatar component (uses the brand mascot robot.png)            */
/* ------------------------------------------------------------------ */
function KnovoAvatar({ speaking, active, size = "md" }: { speaking?: boolean; active?: boolean; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "w-[22rem] h-[22rem] md:w-[28rem] md:h-[28rem]" : size === "md" ? "w-72 h-72 md:w-80 md:h-80" : "w-48 h-48";
  const imgSize = size === "lg" ? 500 : size === "md" ? 320 : 200;
  return (
    <div className={`relative ${dim} select-none flex items-center justify-center`}>
      {/* pulse rings */}
      {(speaking || active) && (
        <>
          <span className="absolute inset-0 rounded-full border-2 border-purple-400/50 animate-ping" />
          <span className="absolute inset-3 rounded-full border border-violet-400/30 animate-ping" style={{ animationDelay: "0.3s" }} />
        </>
      )}
      {speaking && <span className="absolute inset-0 rounded-full bg-purple-500/15 animate-pulse" />}

      {/* Glow backdrop */}
      <div className={`absolute ${size === "lg" ? "inset-16" : "inset-0"} rounded-full bg-gradient-to-br from-purple-600/20 to-violet-600/20 blur-xl ${
        active || speaking ? "animate-pulse" : ""
      }`} />

      {/* Avatar image */}
      <Image
        src="/robot.png"
        alt="Knovo"
        width={imgSize}
        height={imgSize}
        className={`relative z-10 drop-shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-transform duration-300 ${
          speaking ? "scale-110" : "scale-100"
        }`}
        priority
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Glassmorphism card wrapper                                         */
/* ------------------------------------------------------------------ */
function GlassCard({ children, className = "", hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div
      className={`
        bg-purple-950/30 backdrop-blur-xl border border-purple-500/10
        rounded-2xl shadow-[0_8px_32px_rgba(88,28,135,0.15)]
        ${hover ? "transition-all duration-300 hover:bg-purple-900/30 hover:border-purple-500/25 hover:shadow-purple-800/25 hover:-translate-y-1" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper with fade-in                                       */
/* ------------------------------------------------------------------ */
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <section
      id={id}
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </section>
  );
}

/* ================================================================== */
/*  Main Page Component                                                */
/* ================================================================== */
export default function KnovoLandingPage() {
  /* ---------- VAPI state (unchanged) ---------- */
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<{ id: string; role?: string; text: string }[]>([]);
  const msgIdRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ---------- Mic permission state ---------- */
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  const [micDenied, setMicDenied] = useState(false);

  /* ---------- Post-demo state ---------- */
  const [showPostDemo, setShowPostDemo] = useState(false);

  const workflowId = process.env.NEXT_PUBLIC_DEMO_WORKFLOW_ID!;

  // Auto-scroll transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------- VAPI event handlers (unchanged logic) ---------- */
  useEffect(() => {
    const onCallStart = () => { setRunning(true); setStarting(false); setCallEnded(false); setShowPostDemo(false); };
    const onCallEnd = () => { setRunning(false); setCallEnded(true); setShowPostDemo(true); };
    const onMessage = (msg: any) => {
      const text = msg?.type === "transcript" ? msg.transcript : msg?.text ?? msg?.content ?? "";
      const role = msg?.role ?? (msg?.from ?? "assistant");
      if (!text) return;
      if (msg?.type === "transcript" && msg?.transcriptType && msg.transcriptType !== "final") return;
      const id = `m-${++msgIdRef.current}-${Date.now()}`;
      setMessages((prev) => [...prev, { id, role, text }]);
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (err: any) => { console.error("[vapi] error", err); setStarting(false); setRunning(false); };

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

  /* ---------- Mic permission + start workflow ---------- */
  const requestMicAndStart = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setShowMicPrompt(false);
      startWorkflow();
    } catch {
      setMicDenied(true);
    }
  };

  const startWorkflow = async () => {
    if (!workflowId) { alert("Missing NEXT_PUBLIC_DEMO_WORKFLOW_ID in .env.local"); return; }
    setStarting(true);
    setMessages([]);
    setCallEnded(false);
    setShowPostDemo(false);
    try {
      await vapi.start(undefined, undefined, undefined, workflowId, {
        variableValues: { userName: "Guest", userId: null },
      });
    } catch (err: any) {
      console.error("Failed to start workflow", err);
      alert("Failed to start workflow. See console.");
      setStarting(false);
    }
  };

  const handleTakeDemo = () => {
    setShowMicPrompt(true);
    setMicDenied(false);
  };

  const handleSignIn = () => { window.location.href = "/sign-in"; };

  const handleSkipDemo = () => {
    setShowMicPrompt(false);
    window.location.href = "/sign-in";
  };

  const scrollToDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-[#120a1e] text-gray-100 overflow-x-hidden" style={{ fontFamily: "'DM Sans', 'Satoshi', sans-serif" }}>

      {/* Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* ---- Ambient background ---- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-purple-700/30 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-violet-600/25 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[50%] w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px] -translate-x-1/2" />
        <div className="absolute top-[10%] right-[20%] w-[300px] h-[300px] bg-indigo-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[20%] w-[350px] h-[350px] bg-violet-700/20 rounded-full blur-[110px]" />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      </div>

      {/* ==== MIC PERMISSION OVERLAY ==== */}
      {showMicPrompt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full p-8 text-center space-y-6 border-purple-500/20">
            <div className="flex justify-center">
              <KnovoAvatar speaking={false} active size="sm" />
            </div>
            {!micDenied ? (
              <>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                  Knovo needs to hear your brilliance!
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Grant microphone access so Knovo can listen to your answers and give instant voice feedback.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={requestMicAndStart}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                  >
                    <Mic className="w-4 h-4" /> Allow Microphone
                  </button>
                  <button
                    onClick={handleSkipDemo}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-600 text-gray-300 font-medium hover:bg-white/5 transition-all"
                  >
                    Skip Demo
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-red-400">Microphone access denied</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Knovo needs your mic to run the voice demo. You can enable it in your browser settings or skip to sign-in.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={requestMicAndStart}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </button>
                  <button
                    onClick={handleSkipDemo}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-600 text-gray-300 font-medium hover:bg-white/5 transition-all"
                  >
                    Go to Sign In
                  </button>
                </div>
              </>
            )}
          </GlassCard>
        </div>
      )}

      <div className="relative z-10">

        {/* ============================================================ */}
        {/*  1. HERO SECTION                                              */}
        {/* ============================================================ */}
        <section className="flex flex-col items-center justify-center px-4 pt-24 pb-12 text-center relative">
          {/* Social proof badge */}
          <div className="mb-8 flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-4 py-2 text-sm text-gray-300">
            <div className="flex -space-x-2">
              {["bg-purple-500","bg-indigo-500","bg-cyan-500","bg-pink-500"].map((c,i) => (
                <span key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-[#120a1e] inline-flex items-center justify-center text-[9px] font-bold text-white`}>
                  {["S","A","R","K"][i]}
                </span>
              ))}
            </div>
            <span className="ml-1">Join <strong className="text-white">5,000+</strong> learners</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] max-w-5xl mx-auto">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">Knowledge</span>
            <span className="text-gray-500 mx-2 md:mx-3 font-light text-3xl md:text-6xl lg:text-7xl">+</span>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-300 bg-clip-text text-transparent">Voice</span>
            <span className="text-gray-500 mx-2 md:mx-3 font-light text-3xl md:text-6xl lg:text-7xl">=</span>
            <span className="block sm:inline bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
              KNOVO
            </span>
          </h1>

          <p className="mt-6 md:mt-8 text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
            Speak your answers. AI quizzes on anything — instant feedback, voice-first. Built for students, exam prep, and curious minds.
          </p>
        </section>

        {/* ============================================================ */}
        {/*  2. INTERACTIVE DEMO SECTION                                  */}
        {/* ============================================================ */}
        <Section id="demo" className="py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold">Try the Demo</h2>
              <p className="text-gray-400 mt-2 max-w-lg mx-auto text-sm md:text-base">Click "Take Demo" and have a live voice conversation with Knovo&apos;s AI assistant.</p>
            </div>

            <div className="flex flex-col lg:flex-row items-stretch gap-6">
              {/* Robot panel */}
              <GlassCard className="flex-shrink-0 p-6 flex items-center justify-center h-[380px] md:h-[480px] lg:w-[340px]">
                <div className="relative">
                  <KnovoAvatar speaking={isSpeaking} active={running} size="lg" />
                  {running && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#120a1e] animate-pulse" />
                  )}
                </div>
              </GlassCard>

              {/* Transcript panel */}
              <GlassCard className="flex-1 flex flex-col h-[380px] md:h-[480px] overflow-hidden">
                {/* toolbar */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-sm font-semibold text-gray-300 tracking-wide" style={{ fontFamily: "'Space Mono', monospace" }}>knovo-demo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {running && (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live
                      </span>
                    )}
                    {isSpeaking && (
                      <span className="flex items-center gap-1.5 text-xs text-cyan-400">
                        <Mic className="w-3 h-3 animate-pulse" /> Speaking
                      </span>
                    )}
                  </div>
                </div>

                {/* messages */}
                <div className="flex-1 min-h-0 p-5">
                  <div className="bg-black/30 rounded-xl border border-white/[0.04] h-full overflow-hidden p-4">
                    {/* Post-demo CTA overlay */}
                    {showPostDemo && !running ? (
                      <div className="flex flex-col items-center justify-center h-full text-center gap-5 px-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                          <Award className="w-7 h-7 text-emerald-400" />
                        </div>
                        <p className="text-gray-200 font-semibold text-lg">Liked the interaction?</p>
                        <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                          Create a free account and start exploring voice-enabled features inside Knovo.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 mt-1">
                          <button
                            onClick={handleSignIn}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all"
                          >
                            <ArrowRight className="w-4 h-4" /> Sign In / Create Account
                          </button>
                          <button
                            onClick={() => { setShowPostDemo(false); setCallEnded(false); setMessages([]); handleTakeDemo(); }}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-600 text-gray-300 font-medium hover:bg-white/5 transition-all"
                          >
                            <RefreshCw className="w-4 h-4" /> Retake Demo
                          </button>
                        </div>
                      </div>
                    ) : messages.length === 0 && !starting && !running ? (
                      <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                        <MicOff className="w-10 h-10 text-gray-600" />
                        <p className="text-gray-400 font-medium">Ready for a Demo?</p>
                        <p className="text-gray-500 text-sm">Click "Take Demo" to hear from our AI assistant</p>
                      </div>
                    ) : (
                      <div className="h-full overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: "thin", scrollbarColor: "#7c3aed #1a1a2e" }}>
                        {starting && messages.length === 0 && (
                          <div className="flex items-center gap-2 text-gray-400 text-sm animate-pulse py-4 justify-center">
                            <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            Connecting to Knovo...
                          </div>
                        )}
                        {messages.map((m) => {
                          const isUser = m.role === "user";
                          return (
                            <div
                              key={m.id}
                              className={`rounded-xl p-3.5 ${
                                isUser
                                  ? "bg-blue-500/10 border-l-[3px] border-blue-500 ml-6"
                                  : "bg-purple-500/10 border-l-[3px] border-purple-500"
                              }`}
                            >
                              <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${isUser ? "text-blue-400" : "text-purple-400"}`}>
                                {isUser ? (<><Mic className="w-3 h-3" /> You</>) : (<><Zap className="w-3 h-3 fill-current" /> Knovo</>)}
                              </div>
                              <div className="text-gray-200 text-sm leading-relaxed">{m.text}</div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Demo action buttons (below panels) */}
            {!showPostDemo && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                {!callEnded ? (
                  <button
                    onClick={handleTakeDemo}
                    disabled={starting || running}
                    className={`px-10 py-4 rounded-xl font-semibold text-lg transition-all ${
                      starting || running
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-900/30 hover:scale-[1.03]"
                    }`}
                  >
                    {starting ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" /> Starting Demo...</span>
                    ) : running ? (
                      <span className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" /> Demo Running...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Play className="w-5 h-5 fill-current" /> Take Demo</span>
                    )}
                  </button>
                ) : null}
                <button
                  onClick={handleSignIn}
                  className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl border border-gray-600 text-gray-200 font-medium text-lg hover:bg-white/5 transition-all"
                >
                  Sign In Directly <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  3. HOW IT WORKS                                              */}
        {/* ============================================================ */}
        <Section className="py-16 md:py-24 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 mb-12 max-w-lg mx-auto text-sm md:text-base">Three steps to smarter learning.</p>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* connectors (desktop) */}
              <div className="hidden md:block absolute top-14 left-[33%] w-[34%] h-0.5 bg-gradient-to-r from-purple-500/40 to-cyan-500/40" />
              <div className="hidden md:block absolute top-14 left-[66%] w-[34%] h-0.5 bg-gradient-to-r from-cyan-500/40 to-emerald-500/40" />

              {[
                { icon: <BookOpen className="w-7 h-7 text-purple-400" />, title: "Pick a Topic", desc: "Choose from preset categories or upload your own material.", color: "purple" },
                { icon: <Mic className="w-7 h-7 text-cyan-400" />, title: "Talk with Knovo", desc: "Answer questions and learn through real-time voice interaction.", color: "cyan" },
                { icon: <BarChart3 className="w-7 h-7 text-emerald-400" />, title: "Track Progress", desc: "See scores, leaderboards, and improvement over time.", color: "emerald" },
              ].map((step, i) => (
                <GlassCard key={i} className="p-6 text-center relative" hover>
                  <div className={`w-12 h-12 mx-auto rounded-xl bg-${step.color}-500/10 border border-${step.color}-500/20 flex items-center justify-center mb-4`}>
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest" style={{ fontFamily: "'Space Mono', monospace" }}>Step {i + 1}</span>
                  <h3 className="text-lg font-bold mt-2 mb-2 text-gray-100">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  4. FEATURES SHOWCASE                                         */}
        {/* ============================================================ */}
        <Section className="py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Features</h2>
              <p className="text-gray-400 mt-2 max-w-lg mx-auto text-sm md:text-base">Everything you need for voice-powered learning.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: <Bot className="w-6 h-6" />, title: "Custom RAG Agents", desc: "Schools & individuals create AI tutors fed with their own content via PDF/text. Agents tutor and quiz via voice.", gradient: "from-purple-500/20 to-indigo-500/20", iconColor: "text-purple-400" },
                { icon: <FileText className="w-6 h-6" />, title: "PDF Voice Explainer", desc: "Upload a PDF, and the AI explains it line-by-line or paragraph-by-paragraph in voice.", gradient: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-400" },
                { icon: <Users className="w-6 h-6" />, title: "Team Workspaces", desc: "Groups learn and take quizzes together in shared voice sessions. Supports Kahoot-style quizzes and debate competitions.", gradient: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-400" },
                { icon: <Trophy className="w-6 h-6" />, title: "Leaderboards", desc: "Track team and individual performance with real-time rankings and streaks.", gradient: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-400" },
                { icon: <Headphones className="w-6 h-6" />, title: "Voice Assistant Guide", desc: "A chatbot that guides you through every feature via voice/text and creates study roadmaps.", gradient: "from-pink-500/20 to-rose-500/20", iconColor: "text-pink-400" },
                { icon: <Target className="w-6 h-6" />, title: "Multiple Quiz Modes", desc: "Adaptive difficulty, challenge mode, timed rounds, and more modes coming.", gradient: "from-cyan-500/20 to-blue-500/20", iconColor: "text-cyan-400" },
                { icon: <Zap className="w-6 h-6" />, title: "Instant Voice Feedback", desc: "Get real-time corrections, hints, and explanations — all through voice interaction.", gradient: "from-yellow-500/20 to-amber-500/20", iconColor: "text-yellow-400" },
                { icon: <Brain className="w-6 h-6" />, title: "AI-Powered Quizzes", desc: "Knovo generates quizzes on any topic. Just pick a subject and start talking.", gradient: "from-violet-500/20 to-purple-500/20", iconColor: "text-violet-400" },
                { icon: <Shield className="w-6 h-6" />, title: "Privacy-First", desc: "Your voice data and learning progress are private and secure. Always.", gradient: "from-gray-500/20 to-slate-500/20", iconColor: "text-gray-400" },
              ].map((f, i) => (
                <GlassCard key={i} className="p-5 group" hover>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-3 ${f.iconColor} transition-transform group-hover:scale-110`}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-gray-100 mb-1.5">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  5. TESTIMONIALS / SOCIAL PROOF                               */}
        {/* ============================================================ */}
        <Section className="py-16 md:py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">What Learners Say</h2>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 mb-12">
              {[
                { value: "10,000+", label: "Questions Answered" },
                { value: "500+", label: "Topics Available" },
                { value: "98%", label: "Satisfaction Rate" },
              ].map((s, i) => (
                <GlassCard key={i} className="py-5 px-4 text-center">
                  <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</div>
                  <div className="text-gray-400 text-xs md:text-sm mt-1">{s.label}</div>
                </GlassCard>
              ))}
            </div>

            {/* Testimonial cards */}
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { name: "Aarav M.", role: "JEE Aspirant", text: "Knovo made my physics revision way more engaging. Answering out loud actually helps me remember better than just reading notes.", avatar: "A" },
                { name: "Sneha R.", role: "NEET Prep Student", text: "The voice quizzes feel like having a personal tutor. I use it every night before sleep for a quick biology round.", avatar: "S" },
                { name: "Karthik D.", role: "College Student", text: "I uploaded my semester notes and Knovo turned them into voice quizzes. Saved me hours of making flashcards.", avatar: "K" },
              ].map((t, i) => (
                <GlassCard key={i} className="p-5" hover>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-100 text-sm">{t.name}</div>
                      <div className="text-gray-500 text-xs">{t.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex gap-0.5 mt-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  6. FINAL CTA                                                 */}
        {/* ============================================================ */}
        <Section className="py-16 md:py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <GlassCard className="p-8 md:p-12 text-center relative overflow-hidden">
              {/* glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-600/15 rounded-full blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-600/15 rounded-full blur-[60px]" />

              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                  Ready to learn smarter?
                </h2>
                <p className="text-gray-400 max-w-md mx-auto text-sm md:text-base leading-relaxed">
                  Join thousands of learners using voice-powered AI to study faster, retain more, and have fun doing it.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <button
                    onClick={handleSignIn}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.03]"
                  >
                    <Rocket className="w-5 h-5" /> Get Started Free
                  </button>
                  <button
                    onClick={() => { scrollToDemo(); setTimeout(handleTakeDemo, 600); }}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-gray-600 text-gray-200 font-medium text-lg hover:bg-white/5 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" /> Try Demo
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  FOOTER                                                       */}
        {/* ============================================================ */}
        <footer className="py-8 px-4 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
            <p>Experience the future of interactive learning with AI-powered voice technology.</p>
            <p className="mt-2 text-gray-600 text-xs">&copy; {new Date().getFullYear()} Knovo. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}