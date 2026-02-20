"use client";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

interface Message {
  role: "bot" | "user";
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "bot",
    text: "👋 Hi! I'm Knovo's AI assistant. I can help you navigate features, suggest study topics, and create learning roadmaps. How can I help you today?",
  },
];

const ChatbotPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Allow external triggers (e.g. feature card button) to open the chatbot
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handler);
    return () => window.removeEventListener("open-chatbot", handler);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Placeholder bot response
    setTimeout(() => {
      const botMsg: Message = {
        role: "bot",
        text: "Thanks for your message! This feature is coming soon — I'll be able to help you with study roadmaps, feature navigation, and personalized recommendations. Stay tuned! 🚀",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  return (
    <>
      {/* Toggle button — visible when panel is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 border border-purple-500/30"
          style={{
            background: "var(--chatbot-bg)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:inline">
            AI Assistant
          </span>
        </button>
      )}

      {/* Side panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "min(380px, 90vw)" }}
      >
        <div
          className="h-full flex flex-col border-l border-purple-500/20 shadow-2xl"
          style={{
            background: "var(--chatbot-bg)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Knovo Assistant
                </h3>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted-custom)" }}
                >
                  AI-powered study helper
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-purple-500/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-purple-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-br-md"
                      : "bg-purple-500/10 text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-purple-300" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-purple-500/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-background border border-purple-500/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button
                type="submit"
                className="px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Backdrop overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default ChatbotPanel;
