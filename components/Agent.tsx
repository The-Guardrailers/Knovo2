"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { QuizMaster } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="relative flex items-center justify-center">
    {/* Outer rotating ring with gradient effect */}
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600"></div>

    {/* Inner pulsing dot for extra visual appeal */}
    <div className="absolute animate-pulse rounded-full h-2 w-2 bg-blue-600"></div>
  </div>
);

// Enhanced Loading Overlay with gradient theme - FULL SCREEN
const LoadingOverlay = ({
  isLoading,
  message,
}: {
  isLoading: boolean;
  message: string;
}) => {
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-6 shadow-2xl border border-gray-100 animate-slideIn">
        <LoadingSpinner />
        <div className="text-center">
          <p className="text-gray-700 font-semibold text-lg mb-2">{message}</p>
          <div className="flex justify-center space-x-1">
            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Agent = ({
  userName,
  userId,
  type,
  questions,
  quizId,
  quizType,
  feedbackId,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

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

  useEffect(() => {
    if (messages.length > 0) {
      console.log("New message:", messages[messages.length - 1]);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");
      setIsGeneratingFeedback(true);

      const { success, feedbackId: id } = await createFeedback({
        quizId: quizId!,
        userId: userId!,
        quizType: quizType!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/quiz/${quizId}/feedback`);
      } else {
        console.log("Error saving feedback");
        setIsGeneratingFeedback(false);
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, type, userId, quizId, feedbackId, router]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(
        undefined,
        undefined,
        undefined,
        process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
        {
          variableValues: {
            userName: userName,
            userId: userId,
          },
        },
      );
    } else {
      let formattedQuestions = "";
      if (questions && quizType) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(QuizMaster, {
        variableValues: {
          questions: formattedQuestions,
          type: quizType,
        },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <LoadingOverlay
        isLoading={isGeneratingFeedback}
        message="Generating your personalized feedback..."
      />

      {/* Participants Section - Reduced margin */}
      <div className="call-view mb-6">
        <div className="card-interviewer bg-gradient-to-br from-slate-800 via-purple-900 to-indigo-900 rounded-3xl overflow-hidden shadow-2xl border border-purple-500/20 p-28">
          <div className="avatar relative">
            <div className="absolute bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-20 blur"></div>

            <Image
              src="/robot.png"
              alt="robot"
              width={150}
              height={130}
              className="object-cover"
            />

            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3 className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent font-bold">
            KNOVO AI
          </h3>
        </div>

        {/* User Profile Card with gradient styling */}
        <div className="card-border rounded-4xl bg-gradient-to-br from-slate-800 via-purple-900 to-indigo-900 border-purple-400/30 mb-2">
          <div className="card-content bg-gradient-to-br from-slate-800 via-purple-900 to-indigo-900 rounded-3xl mb-12 overflow-hidden shadow-2xl border border-purple-500/20 p-28">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-20 blur"></div>
              <Image
                src="/user.png"
                alt="profile-image"
                width={120}
                height={120}
                className="relative rounded-full object-cover size-[120px] border-2 border-purple-400/30"
              />
            </div>
            <h3 className="text-white font-semibold">{userName}</h3>
          </div>
        </div>
      </div>

      {/* Transcript Section - Reduced margin */}
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl border-2 border-purple-500/30 shadow-2xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              </div>
              <h3 className="text-xl font-bold text-white">Live Transcript</h3>
            </div>
            <div className="flex items-center gap-3">
              {isSpeaking && (
                <>
                  <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                    <span className="text-emerald-300 text-sm font-medium">
                      Listening
                    </span>
                  </div>
                  <div className="flex gap-1">
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

        <div className="p-6">
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-600/30 p-4 min-h-[300px] max-h-[400px] overflow-auto shadow-inner">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 bg-purple-700/30 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                  <svg
                    className="w-8 h-8 text-purple-300"
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
                <p className="text-purple-200 text-lg">No transcripts yet</p>
                <p className="text-purple-300 text-sm mt-2">
                  Start a call to see live transcription
                </p>
              </div>
            ) : (
              <div className="space-y-3 flex flex-col w-full">
                {messages.map((m, i) => (
                  <div
                    key={`m-${i}`}
                    className={`p-4 rounded-xl max-w-fit ${
                      m.role === "user"
                        ? "bg-blue-500/10 border-l-4 border-blue-400 ml-6 self-end"
                        : "bg-purple-500/10 border-l-4 border-purple-400 mr-6 self-start"
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                        m.role === "user" ? "text-blue-300" : "text-purple-300"
                      }`}
                    >
                      {m.role === "user" ? "👤 You" : "🤖 Assistant"}
                    </div>
                    <div className="text-white leading-relaxed">
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call Button - Centered with gradient styling */}
      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative group p-4 w-44" onClick={handleCall}>
            <div className="absolute -inset-0 bg-gradient-to-r from-green-500 to-green-400 rounded-2xl opacity-60 blur group-hover:opacity-100 transition duration-100"></div>
            <div
              className={cn(
                "relative bg-gradient-to-r from-green-800 to-green-600 rounded-2xl px-8 py-4 border border-purple-400/30 shadow-lg transition-all duration-200 hover:shadow-lg",
                callStatus === "CONNECTING" && "animate-pulse",
              )}
            >
              <span className="relative text-white text-2xl font-semibold">
                {callStatus === "INACTIVE" || callStatus === "FINISHED"
                  ? "Start"
                  : "..."}
              </span>
            </div>
          </button>
        ) : (
          <button
            className="relative group p-4 w-44"
            onClick={handleDisconnect}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
            <div className="relative bg-gradient-to-r from-red-800 to-pink-800 rounded-xl px-8 py-4 border border-red-400/30 shadow-lg transition-all duration-200 hover:shadow-lg">
              <span className="text-white text-2xl font-semibold">End</span>
            </div>
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
