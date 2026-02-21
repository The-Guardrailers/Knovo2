"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Upload,
  Play,
  Square,
  Loader2,
  Volume2,
} from "lucide-react";
import { useConversation } from "@elevenlabs/react";

export default function PdfExplainerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<
    { message: string; source: string }[]
  >([]);

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => console.log("ElevenLabs Connected"),
    onDisconnect: () => {
      console.log("ElevenLabs Disconnected");
      setActiveParagraphIndex(null);
    },
    onError: (error) => console.error("ElevenLabs Error:", error),
    onMessage: (message) => {
      setMessages((prev) => [
        ...prev,
        { message: message.message, source: message.source },
      ]);
    },
  });

  // Auto-scroll transcript when new messages arrive
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsExtracting(true);
    setParagraphs([]);
    setMessages([]); // Clear previous conversation

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to extract text");

      const data = await response.json();
      setParagraphs(data.paragraphs || []);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to parse PDF. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const explainParagraph = async (index: number, text: string) => {
    if (conversation.status === "connected") {
      await conversation.endSession();
    }

    // Grab agent ID from environment variables
    const agentId = process.env.NEXT_PUBLIC_PDF_AGENT_ID;

    if (!agentId) {
      alert("Agent ID is missing in configuration.");
      return;
    }

    try {
      setActiveParagraphIndex(index);
      setMessages([]); // Clear chat for new paragraph

      await navigator.mediaDevices.getUserMedia({ audio: true }); // Request mic permission needed by SDK

      await conversation.startSession({
        agentId: agentId,
        dynamicVariables: {
          pdf_text: text,
        },
      } as any);

      // Delay slightly to ensure connection is established before triggering explanation
      setTimeout(() => {
        try {
          console.log("Triggering explicit explanation for:", text);

          // Give a contextual update setting the expectation: explain right away
          conversation.sendContextualUpdate(
            `[SYSTEM MESSAGE]\nThe user has provided the text and is waiting for you to explain it. Do not ask if they are ready or if they want to hear it. Begin your verbal explanation of the provided text immediately.\n\nText to explain:\n"""\n${text}\n"""`,
          );

          // Force the agent to begin its turn by sending a simulated user start message
          setTimeout(() => {
            conversation.sendUserMessage(
              "I am ready. Please begin explaining the text to me right now.",
            );
          }, 500);
        } catch (e) {
          console.warn("Could not send immediate explanation trigger", e);
        }
      }, 1500); // 1.5s delay to assure the WebRTC connection is fully hooked up
    } catch (error: any) {
      console.error("Failed to start explanation session:", error);
      setActiveParagraphIndex(null);

      // Specifically handle microphone denied errors
      if (
        error.name === "NotAllowedError" ||
        error.message?.includes("Permission denied")
      ) {
        alert(
          "Microphone access is required to talk to the Voice Agent. The page will now reload so you can grant permission.",
        );
        window.location.reload();
      } else {
        alert(
          "Failed to connect to the Voice Agent. Please make sure your microphone is connected and permissions are granted.",
        );
      }
    }
  };

  const stopExplanation = async () => {
    await conversation.endSession();
    setActiveParagraphIndex(null);
  };

  // Helper to get visually pleasing status colors/text
  const getStatusDisplay = () => {
    if (activeParagraphIndex === null)
      return {
        text: "Select a paragraph to begin",
        color: "text-purple-400/50",
      };
    if (conversation.status === "connecting")
      return { text: "Connecting...", color: "text-yellow-400" };
    if (conversation.status === "connected") {
      if (conversation.isSpeaking)
        return { text: "Agent is speaking...", color: "text-green-400" };
      return { text: "Listening to you...", color: "text-blue-400" };
    }
    return { text: "Disconnected", color: "text-gray-400" };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen text-center gap-6 p-8 max-w-6xl mx-auto">
      {/* HEADER SECTION */}
      <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center mt-10">
        <FileText className="w-10 h-10 text-purple-400" />
      </div>
      <h1 className="text-4xl font-black text-foreground">
        Voice PDF Explainer
      </h1>
      <p
        className="text-lg max-w-xl"
        style={{ color: "var(--text-secondary)" }}
      >
        Upload any PDF and our AI Tutor will explain it paragraph-by-paragraph.
      </p>

      {/* UPLOADER */}
      {!file && (
        <label className="cursor-pointer flex flex-col items-center justify-center w-full max-w-2xl h-64 border-2 border-dashed border-purple-500/30 rounded-2xl bg-[#0f0a1f] hover:bg-[#1a1130] transition-all">
          <Upload className="w-12 h-12 text-purple-400 mb-4" />
          <span className="text-lg text-purple-200 font-medium">
            Click to upload a PDF
          </span>
          <span className="text-sm text-purple-400/60 mt-2">Max 10MB</span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      )}

      {isExtracting && (
        <div className="flex items-center gap-3 text-purple-400 animate-pulse mt-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Extracting text from PDF...</span>
        </div>
      )}

      {/* MAIN CONTENT AREA: Split screen when analyzing */}
      {paragraphs.length > 0 && (
        <div className="w-full flex flex-col lg:flex-row gap-8 mt-8 text-left">
          {/* LEFT PANEL: The PDF Text */}
          <div
            className={`flex-1 bg-[#0f0a1f] rounded-2xl border border-purple-500/20 flex flex-col overflow-hidden ${
              activeParagraphIndex !== null ? "h-[550px]" : ""
            }`}
          >
            <div className="p-6 pb-4 border-b border-purple-500/20 bg-[#0f0a1f] z-10 shrink-0 shadow-sm">
              <h2 className="text-xl font-bold text-white">Document Content</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">
              <div className="space-y-6">
                {paragraphs.map((text, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-xl transition-all relative group ${
                      activeParagraphIndex === idx
                        ? "bg-purple-500/10 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                        : "bg-white/5 border border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base pr-12">
                      {text}
                    </p>

                    <div className="flex justify-end pt-2">
                      {activeParagraphIndex === idx &&
                      conversation.status === "connected" ? (
                        <button
                          onClick={stopExplanation}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm font-medium text-sm"
                          title="Stop Explanation"
                        >
                          <Square className="w-4 h-4 fill-current" />
                          Stop Explaining
                        </button>
                      ) : (
                        <button
                          onClick={() => explainParagraph(idx, text)}
                          className={`${
                            activeParagraphIndex === idx
                              ? "bg-purple-500 text-white animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                              : "bg-white/5 text-purple-200/50 hover:bg-pink-500/20 hover:text-pink-300 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                          } px-4 py-2 text-sm rounded-xl transition-all flex items-center justify-center gap-2 font-medium`}
                          title="Explain this section"
                          disabled={conversation.status === "connecting"}
                        >
                          {activeParagraphIndex === idx &&
                          conversation.status === "connecting" ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-current" />
                              Explain this paragraph
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: The Agent UI & Transcript */}
          {activeParagraphIndex !== null && (
            <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col gap-4 h-[550px]">
              {/* Agent Voice Orb UI */}
              <div className="bg-[#0f0a1f] rounded-2xl border border-purple-500/20 p-8 flex flex-col items-center justify-center shrink-0">
                <div className="relative mb-6 mt-4">
                  {/* The Orb */}
                  <div
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                      conversation.isSpeaking
                        ? "bg-gradient-to-tr from-purple-500 to-blue-400 shadow-[0_0_50px_rgba(168,85,247,0.6)] scale-110"
                        : conversation.status === "connected"
                          ? "bg-gradient-to-tr from-purple-500/40 to-blue-400/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                          : "bg-gray-800 border-2 border-gray-700"
                    }`}
                  >
                    {conversation.status === "connected" ? (
                      <Volume2
                        className={`w-12 h-12 text-white ${conversation.isSpeaking ? "animate-pulse" : "opacity-50"}`}
                      />
                    ) : (
                      <Loader2 className="w-10 h-10 text-gray-500 animate-spin" />
                    )}
                  </div>

                  {/* Concentric rings for active speech */}
                  {conversation.isSpeaking && (
                    <>
                      <div
                        className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-ping"
                        style={{ animationDuration: "2s" }}
                      ></div>
                      <div
                        className="absolute inset-[-20px] rounded-full border border-blue-400/20 animate-ping"
                        style={{
                          animationDuration: "3s",
                          animationDelay: "0.5s",
                        }}
                      ></div>
                    </>
                  )}
                </div>

                <div
                  className={`text-lg font-medium tracking-wide ${statusDisplay.color}`}
                >
                  {statusDisplay.text}
                </div>
                {conversation.status === "connected" && (
                  <div className="text-xs text-gray-500 mt-2">
                    Speak into your mic to ask questions
                  </div>
                )}
              </div>

              {/* Chat Transcript UI */}
              <div className="flex-1 bg-[#0f0a1f] rounded-2xl border border-purple-500/20 p-4 flex flex-col overflow-hidden">
                <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-4 border-b border-purple-500/20 pb-2 shrink-0">
                  Live Transcript
                </h3>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2 pb-10">
                      <FileText className="w-8 h-8 opacity-20" />
                      <p className="text-sm">Conversation will appear here</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${msg.source === "user" ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[10px] text-gray-500 mb-1 px-1">
                          {msg.source === "user" ? "You" : "AI Tutor"}
                        </span>
                        <div
                          className={`px-4 py-2.5 rounded-2xl max-w-[90%] text-sm ${
                            msg.source === "user"
                              ? "bg-purple-600 text-white rounded-br-none"
                              : "bg-[#2a1b4d] text-purple-100 rounded-bl-none border border-purple-500/30"
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
            </div>
          )}
        </div>
      )}

      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors mt-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
