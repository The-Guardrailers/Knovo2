"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  FileText,
  Users,
  Zap,
  PenSquare,
  Mail,
  HelpCircle,
  Star,
  Send,
  Copy,
  Check,
} from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [copied, setCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const features = [
    { name: "Personalized Tutors", href: "/tutors", icon: GraduationCap },
    { name: "PDF Explainer", href: "/pdf-explainer", icon: FileText },
    { name: "Workspaces", href: "/workspaces", icon: Users },
    { name: "Challenges", href: "/multiplayer", icon: Zap },
    { name: "Custom Quizzes", href: "/quiz", icon: PenSquare },
  ];

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setInviteSent(true);
      setTimeout(() => setInviteSent(false), 3000);
      setEmail("");
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText("https://knovo.app/invite");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="w-full border-t border-purple-500/20 mt-12">
      <div
        className="py-12 px-6 lg:px-16"
        style={{ background: "var(--footer-bg)" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Top Row: 4 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Column 1: Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                Quick Links
              </h3>
              <ul className="space-y-2 list-none">
                {features.map((f) => (
                  <li key={f.name}>
                    <Link
                      href={f.href}
                      className="flex items-center gap-2 text-sm hover:text-purple-400 transition-colors duration-200"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <f.icon className="w-4 h-4" />
                      {f.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Invite Friends */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                Invite Friends
              </h3>
              <p
                className="text-sm mb-3"
                style={{ color: "var(--text-muted-custom)" }}
              >
                Share KNOVO with your friends and learn together!
              </p>
              <form onSubmit={handleInvite} className="flex gap-2 mb-3">
                <input
                  type="email"
                  placeholder="friend@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-purple-500/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  {inviteSent ? "Sent!" : "Send"}
                </button>
              </form>
              <button
                onClick={copyInviteLink}
                className="flex items-center gap-2 text-sm hover:text-purple-400 transition-colors cursor-pointer"
                style={{ color: "var(--text-secondary)" }}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Link copied!" : "Copy invite link"}
              </button>
            </div>

            {/* Column 3: Help & Support */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                Help & Support
              </h3>
              <ul className="space-y-2 list-none">
                <li>
                  <button
                    className="text-sm hover:text-purple-400 transition-colors cursor-pointer"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    📖 FAQ & Documentation
                  </button>
                </li>
                <li>
                  <button
                    className="text-sm hover:text-purple-400 transition-colors cursor-pointer"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    💬 Contact Support
                  </button>
                </li>
                <li>
                  <button
                    className="text-sm hover:text-purple-400 transition-colors cursor-pointer"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    🐛 Report a Bug
                  </button>
                </li>
                <li>
                  <button
                    className="text-sm hover:text-purple-400 transition-colors cursor-pointer"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    💡 Feature Request
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Rate KNOVO */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-400" />
                Rate KNOVO
              </h3>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-muted-custom)" }}
              >
                Help us improve! Rate your experience.
              </p>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="cursor-pointer transition-transform duration-200 hover:scale-125"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors duration-200 ${
                        star <= (hoveredStar || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-500"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-purple-400 animate-fadeIn">
                  Thanks for rating us {rating}/5! ⭐
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-6" />

          {/* Bottom Row: Logo + Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Logo" width={28} height={28} />
              <span className="bg-gradient-to-r from-purple-700 via-pink-500 to-yellow-600 bg-clip-text text-transparent text-2xl font-semibold">
                KNOVO
              </span>
            </Link>
            <p
              className="text-sm"
              style={{ color: "var(--text-muted-custom)" }}
            >
              © {new Date().getFullYear()} KNOVO. AI-powered voice-based quiz
              platform.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
