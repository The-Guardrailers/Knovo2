"use client";

import Image from "next/image";
import Link from "next/link";
import { useDashboardTab } from "@/lib/DashboardContext";
import {
  GraduationCap,
  FileText,
  Users,
  Zap,
  PenSquare,
  MessageSquare,
  Sparkles,
  Star,
  ArrowRight,
} from "lucide-react";
import ChatbotPanel from "@/components/ChatbotPanel";

const allFeatures = [
  {
    title: "Personalized Tutors",
    description:
      "AI tutors tailored to your learning style, pace, and goals. Get 1-on-1 voice tutoring on any subject.",
    icon: GraduationCap,
    href: "/tutors",
    gradient: "from-violet-600 to-purple-600",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
    borderAccent: "border-l-violet-500",
    tab: "home",
  },
  {
    title: "Voice PDF Explainer",
    description:
      "Upload any PDF and get it explained line-by-line or paragraph-by-paragraph with voice narration.",
    icon: FileText,
    href: "/pdf-explainer",
    gradient: "from-blue-600 to-cyan-600",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    borderAccent: "border-l-blue-500",
    tab: "home",
  },
  {
    title: "Custom Quizzes",
    description:
      "Create AI-powered quizzes on any topic with voice or form-based generation. Practice and get instant feedback on your knowledge.",
    icon: PenSquare,
    href: "/quiz",
    gradient: "from-pink-600 to-rose-600",
    iconBg: "bg-pink-500/20",
    iconColor: "text-pink-400",
    borderAccent: "border-l-pink-500",
    tab: "home",
  },
  {
    title: "AI Chatbot",
    description:
      "Your smart study companion — get feature guidance, study roadmaps, topic recommendations, and instant answers to any question.",
    icon: MessageSquare,
    href: "#chatbot",
    gradient: "from-purple-600 to-indigo-600",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    borderAccent: "border-l-purple-500",
    tab: "home",
    isChatbot: true,
  },
  {
    title: "Workspaces",
    description:
      "Collaborative learning spaces with team quizzes, leaderboards, and debate competitions. Invite friends and learn together in real-time.",
    icon: Users,
    href: "/workspaces",
    gradient: "from-emerald-600 to-teal-600",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    borderAccent: "border-l-emerald-500",
    tab: "premium",
  },
  {
    title: "Challenges",
    description:
      "Multiple quiz modes with adaptive difficulty, timed rounds, and head-to-head competitions. Compete with learners worldwide.",
    icon: Zap,
    href: "/challenges",
    gradient: "from-orange-500 to-amber-500",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    borderAccent: "border-l-orange-500",
    tab: "premium",
  },
];

export default function Home() {
  const { activeTab } = useDashboardTab();

  const features = allFeatures.filter((f) => f.tab === activeTab);

  return (
    <>
      {/* ──── Welcome Hero ──── */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl border border-purple-500/15 p-8 sm:p-10 lg:p-14"
        style={{ background: "var(--hero-bg)" }}
      >
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full -translate-y-20 translate-x-20 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full translate-y-16 -translate-x-16 blur-[60px]" />

        {/* Floating icons */}
        <div className="absolute top-6 right-10 opacity-25 animate-bounce">
          <Star className="w-5 h-5 text-yellow-400" />
        </div>
        <div
          className="absolute bottom-8 right-16 opacity-20 animate-bounce"
          style={{ animationDelay: "1s" }}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          {/* Left: Text */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-300">
                Welcome back!
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
              {activeTab === "home" ? (
                <>
                  Explore{" "}
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                    Features
                  </span>
                </>
              ) : (
                <>
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                    Premium
                  </span>{" "}
                  Features
                </>
              )}
            </h1>
            <p
              className="text-base md:text-lg leading-relaxed max-w-xl"
              style={{ color: "var(--text-secondary)" }}
            >
              {activeTab === "home"
                ? "Explore AI-powered quizzes, tutoring sessions, and smart learning tools — all powered by voice."
                : "Unlock collaborative workspaces, competitive challenges, and advanced features with Premium."}
            </p>
          </div>

          {/* Right: Robot / Design Graphic */}
          <div className="hidden lg:flex items-center justify-center relative w-[320px] h-[280px]">
            {/* Background glowing orb */}
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />

            <Image
              fill
              src="/robot.png"
              alt="Knovo Robot"
              sizes="600px"
              className="object-contain drop-shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-pulse hover:scale-105 transition-transform duration-500 cursor-pointer"
              priority
            />

            {/* Floating smaller tech-like icons (optional embellishments like the reference) */}
            <div
              className="absolute top-4 -right-4 w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center animate-bounce shadow-[0_0_15px_rgba(236,72,153,0.3)]"
              style={{ animationDelay: "0.5s" }}
            >
              <Star className="w-4 h-4 text-pink-400" />
            </div>
            <div
              className="absolute bottom-4 -left-4 w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center animate-bounce shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              style={{ animationDelay: "1s" }}
            >
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ──── Feature Sections ──── */}
      <section className="space-y-6">
        <div className="flex flex-col gap-5">
          {features.map((feature) => {
            const FeatureCard = (
              <div
                key={feature.title}
                className={`group relative rounded-2xl p-8 md:p-10 transition-all duration-300 hover:shadow-2xl cursor-pointer overflow-hidden border border-l-4 ${feature.borderAccent}`}
                style={{
                  background: "var(--feature-card-bg)",
                  borderColor: "var(--feature-card-border)",
                  borderLeftColor: undefined,
                }}
              >
                {/* Hover glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300 rounded-2xl`}
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 group-hover:text-purple-400 dark:group-hover:text-purple-300 transition-colors duration-200">
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm md:text-base leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {feature.description}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${feature.gradient} text-white font-semibold text-sm shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}
                    >
                      {feature.isChatbot ? "Open Chat" : "Open"}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );

            if (feature.isChatbot) {
              return (
                <div
                  key={feature.title}
                  onClick={() =>
                    window.dispatchEvent(new Event("open-chatbot"))
                  }
                >
                  {FeatureCard}
                </div>
              );
            }

            return (
              <Link key={feature.title} href={feature.href}>
                {FeatureCard}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ──── Chatbot Panel ──── */}
      <ChatbotPanel />
    </>
  );
}
