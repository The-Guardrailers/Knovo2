"use client";
import QuizForm from "@/components/QuizForm";
import QuizCard from "@/components/QuizCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getLatestQuizzes,
  getQuizzesByUserId,
} from "@/lib/actions/general.action";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const QuizPage = () => {
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser?.id) {
        const [myQuizzes, latest] = await Promise.all([
          getQuizzesByUserId(currentUser.id),
          getLatestQuizzes({ userId: currentUser.id }),
        ]);
        setUserQuizzes(myQuizzes || []);
        setAllQuizzes(latest || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (showQuizForm) {
    return (
      <div>
        <button
          onClick={() => setShowQuizForm(false)}
          className="mb-6 group relative overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 p-[2px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 px-8 py-4 rounded-2xl hover:bg-opacity-80 transition-all duration-300 group-hover:scale-[1.02]">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-white group-hover:text-pink-300 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <h2 className="font-bold text-white text-lg bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text group-hover:from-purple-200 group-hover:via-pink-200 group-hover:to-blue-200 transition-all duration-300">
                  Choose Generation Method
                </h2>
              </div>
            </div>
          </div>
        </button>
        <div className="flex flex-col items-center justify-center gap-8 p-4">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 p-1 rounded-3xl shadow-2xl mb-4">
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 px-20 py-6 rounded-3xl">
              <h2 className="text-center text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                QUIZ GENERATION
              </h2>
            </div>
          </div>
          {user?.id && <QuizForm userId={user.id} />}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Generation Method Cards */}
      <div className="call-view w-full px-4 sm:px-6 flex flex-col md:flex-row gap-8 justify-center items-stretch">
        <div
          className="card-interviewer rounded-4xl cursor-pointer hover:opacity-80 transition-opacity flex-1 flex flex-col items-center justify-center bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 border border-purple-500/20"
          onClick={() => setShowQuizForm(true)}
        >
          <Image
            src="/knovo-form.png"
            alt="form"
            width={125}
            height={105}
            className="object-contain"
          />
          <h3 className="text-xl font-semibold text-center">
            Form Based Generation
          </h3>
        </div>
        <Link
          href={"https://knovo-dhlb.vercel.app/quiz/vic-workflow"}
          className="flex-1"
        >
          <div className="card-interviewer h-full rounded-4xl cursor-pointer hover:opacity-80 transition-opacity flex-1 flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20">
            <Image
              src="/knovo-vic.png"
              alt="vic-image"
              width={125}
              height={105}
              className="object-contain"
            />
            <h3 className="text-xl font-semibold text-center">
              Voice Based Generation
            </h3>
          </div>
        </Link>
      </div>

      {/* Your Quizzes */}
      <section className="flex flex-col gap-6">
        <h2>Your Quizzes</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading quizzes...</p>
        ) : (
          <div className="interviews-section">
            {userQuizzes.length > 0 ? (
              userQuizzes.map((quiz) => (
                <QuizCard {...quiz} key={quiz.id} viewerId={user?.id} />
              ))
            ) : (
              <p>You haven&apos;t taken any quizzes yet</p>
            )}
          </div>
        )}
      </section>

      {/* Take a Quiz */}
      <section className="flex flex-col gap-6">
        <h2>Take a Quiz</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading quizzes...</p>
        ) : (
          <div className="interviews-section">
            {allQuizzes.length > 0 ? (
              allQuizzes.map((quiz) => (
                <QuizCard {...quiz} key={quiz.id} viewerId={user?.id} />
              ))
            ) : (
              <p>There are no new quizzes available</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
export default QuizPage;
