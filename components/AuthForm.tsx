"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const AuthFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(7) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
  });
};

import React, { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import FormField from "./FormFeild";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { signIn, signUp } from "@/lib/actions/auth.action";
import { auth } from "@/firebase/client";
import ForgotPasswordModal from "./ForgotPasswordModal";

/* ───── Loading overlay (dark-themed) ───── */
const LoadingSpinner = () => (
  <div className="relative flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-300/30 border-t-purple-400"></div>
    <div className="absolute animate-pulse rounded-full h-2 w-2 bg-purple-400"></div>
  </div>
);

const LoadingOverlay = ({
  isLoading,
  message,
}: {
  isLoading: boolean;
  message: string;
}) => {
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl border border-purple-500/20"
        style={{ background: "linear-gradient(to bottom, #1e0a3c, #2a0845)" }}
      >
        <LoadingSpinner />
        <div className="text-center">
          <p className="text-gray-200 font-semibold text-lg mb-2">{message}</p>
          <div className="flex justify-center space-x-1">
            <div className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const formSchema = AuthFormSchema(type);

  // Conventiional Loading method
  const [isLoading, setLoading] = useState(false);
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Definition of the form //
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 2.Submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      if (type === "sign-up") {
        const { name, email, password } = values;

        const userCreds = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        const result = await signUp({
          uid: userCreds.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Sucessfully Created. You will be directed to Sign In");
        router.push("/sign-in");
        console.log("Sign Up", values);
      } else {
        const { email, password } = values;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );

        if (!userCredential?.user) {
          throw new Error("Sign-in failed: No user returned");
        }

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          throw new Error("Sign-in failed: No ID token");
        }

        await signIn({ email, idToken });
        toast.success("Successfully Signed In");
        router.push("/");
      }
    } catch (e: any) {
      toast.error(`There was an error : ${e.message}`);
      setLoading(false);
    }
    console.log(values);
  }

  const isSignIn = type === "sign-in";

  return (
    <>
      <LoadingOverlay
        isLoading={isLoading}
        message={isSignIn ? "Signing you in..." : "Creating your account..."}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />

      {/* Dark purplish background matching flyer page + pattern overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, #0e0520 0%, #150838 50%, #0c0420 100%)",
        }}
      >
        <div className="absolute inset-0 bg-[url('/pattern.png')] bg-top bg-no-repeat opacity-60" />
      </div>

      {/* ──── Main card: two-panel layout ──── */}
      <div
        className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_20px_80px_rgba(88,28,135,0.35)] border border-purple-500/10"
        style={{
          background:
            "linear-gradient(145deg, #150730 0%, #1e0a40 50%, #140628 100%)",
        }}
      >
        <div className="flex flex-col lg:flex-row">
          {/* ──── LEFT: Branding panel (hidden on mobile) ──── */}
          <div
            className="hidden lg:flex lg:w-[45%] flex-col items-center justify-end p-6 pb-10 relative overflow-hidden min-h-[560px]"
            style={{
              background: "linear-gradient(160deg, #1e0a3c 0%, #140628 100%)",
            }}
          >
            {/* Ambient glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-600/15 rounded-full blur-[100px]" />

            {/* Robot mascot */}
            <div className="relative z-10 w-[600px] h-[650px] -mt-32 -mb-32 shrink-0">
              <Image
                src="/robot.png"
                alt="Knovo Robot"
                fill
                sizes="650px"
                className="drop-shadow-[0_0_30px_rgba(139,92,246,0.3)] object-contain"
                priority
              />
            </div>

            {/* Headline matching gen-page.png style */}
            <h2 className="relative z-10 text-2xl font-bold text-white text-center leading-snug mb-2">
              Test your <span className="text-purple-300">Knowledge</span> and{" "}
              <span className="text-amber-400">Vocal</span> abilities with AI
            </h2>
            <p className="relative z-10 text-sm text-gray-400 text-center leading-relaxed max-w-xs">
              Practice any topic, any format, any difficulty — get instant
              feedback and detailed evaluation.
            </p>

            {/* Decorative icons */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <span className="text-purple-400 text-2xl">✨</span>
            </div>
            <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
              <span className="text-cyan-400 text-2xl">🎮</span>
            </div>
            <div className="absolute top-20 left-8 w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center rotate-12">
              <span className="text-emerald-400 text-xl">🎯</span>
            </div>
          </div>

          {/* ──── RIGHT: Form panel ──── */}
          <div className="w-full lg:w-[55%] px-8 py-6 md:px-12 md:py-8 flex flex-col justify-center">
            {/* Mobile-only logo row */}
            <div className="flex items-center justify-center gap-3 mb-6 lg:mb-0 lg:hidden">
              <Image src="/logo.svg" alt="Knovo" width={40} height={40} />
              <h1 className="text-3xl font-extrabold tracking-tight">
                <span className="text-purple-300">KN</span>
                <span className="text-amber-400">OVO</span>
              </h1>
            </div>

            {/* Desktop heading */}
            <div className="hidden lg:block mb-8">
              <div className="flex items-center gap-3 mb-5">
                <Image src="/logo.svg" alt="Knovo" width={48} height={48} />
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  KNOVO
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {isSignIn ? "Welcome back!" : "Create your account"}
              </h2>
              <p className="text-gray-400 text-sm">
                {isSignIn
                  ? "Sign in to continue your learning journey"
                  : "Start learning with AI-powered quizzes"}
              </p>
            </div>

            {/* Mobile heading */}
            <div className="lg:hidden text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-1">
                {isSignIn ? "Welcome back!" : "Create your account"}
              </h2>
              <p className="text-gray-400 text-sm">
                {isSignIn
                  ? "Sign in to continue your learning journey"
                  : "Start learning with AI-powered quizzes"}
              </p>
            </div>

            {/* ──── Form ──── */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6 form"
              >
                {!isSignIn && (
                  <FormField
                    control={form.control}
                    name="name"
                    label="Name"
                    placeholder="Your full name"
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                />

                <FormField
                  control={form.control}
                  name="password"
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                />

                {isSignIn && (
                  <div className="flex justify-end -mt-2">
                    <p
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-sm font-medium text-purple-400 hover:text-purple-300 cursor-pointer transition-colors"
                    >
                      Forgot Password?
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full text-white font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(139,92,246,0.4)] active:scale-[0.98] cursor-pointer"
                  style={{
                    background: "linear-gradient(to right, #9333ea, #6366f1)",
                  }}
                >
                  {isSignIn ? "Sign In" : "Create Account"}
                </button>
              </form>
            </Form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-purple-500/20" />
              <span className="text-xs text-gray-500 uppercase tracking-widest">
                or
              </span>
              <div className="flex-1 h-px bg-purple-500/20" />
            </div>

            {/* Toggle */}
            <p className="text-center text-gray-400">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}
              <Link
                href={!isSignIn ? "/sign-in" : "/sign-up"}
                className="font-bold text-purple-400 hover:text-purple-300 ml-2 transition-colors"
              >
                {!isSignIn ? "Sign In" : "Sign Up"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthForm;
