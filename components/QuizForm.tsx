"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Upload, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// ✅ ROBUST ZOD SCHEMA (treats "", spaces as empty; validates topic OR pdf)
const QuizFormSchema = z
  .object({
    type: z.enum(["true/false", "multiple choice", "verbal answer"]),
    topic: z
      .string()
      .transform((v) => (v ?? "").trim())
      .optional(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    amount: z.string().min(1, "Number of questions is required"),
    userId: z.string().min(1, "User ID is required"),
    pdfData: z.string().optional(),
    pdfName: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasTopic = (data.topic ?? "").trim().length > 0;
    const hasPdf = (data.pdfData ?? "").length > 0;
    if (!hasTopic && !hasPdf) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a topic or upload a PDF.",
        path: ["topic"],
      });
    }
  });

type QuizFormValues = z.infer<typeof QuizFormSchema>;

interface QuizFormProps {
  userId: string;
}

const QuizForm = ({ userId }: QuizFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(QuizFormSchema),
    defaultValues: {
      type: "multiple choice",
      topic: "",
      difficulty: "medium",
      amount: "5",
      userId: userId,
      pdfData: "",
      pdfName: "",
    },
    mode: "onChange",
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a valid PDF file.");
        event.target.value = "";
        setFileName(null);
        form.setValue("pdfData", "", { shouldValidate: true });
        form.setValue("pdfName", "", { shouldValidate: false });
        form.trigger(["topic", "pdfData"]);
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result?.toString().split(",")[1] || "";
        form.setValue("pdfData", base64String, { shouldValidate: true });
        form.setValue("pdfName", file.name, { shouldValidate: false });
        form.setValue("topic", "", { shouldValidate: true });
        form.clearErrors(["topic", "pdfData"]);
        form.trigger(["topic", "pdfData"]);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast.error("Failed to read the file.");
        setFileName(null);
        form.setValue("pdfData", "", { shouldValidate: true });
        form.setValue("pdfName", "", { shouldValidate: false });
        form.trigger(["topic", "pdfData"]);
      };
    } else {
      setFileName(null);
      form.setValue("pdfData", "", { shouldValidate: true });
      form.setValue("pdfName", "", { shouldValidate: false });
      form.trigger(["topic", "pdfData"]);
    }
  };

  const handleTopicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    form.setValue("topic", value, { shouldValidate: true });

    if (value) {
      setFileName(null);
      form.setValue("pdfData", "", { shouldValidate: true });
      form.setValue("pdfName", "", { shouldValidate: false });
      const fileInput = document.getElementById(
        "pdf-upload",
      ) as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    }

    form.clearErrors(["topic", "pdfData"]);
    form.trigger(["topic", "pdfData"]);
  };

  async function onSubmit(values: QuizFormValues) {
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://knovo-dhlb.vercel.app/api/vapi/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      await response.json();
      toast.success("Quiz generated successfully! Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error: any) {
      toast.error(`Failed to generate quiz: ${error.message}`);
      console.error("Quiz generation error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="w-full rounded-2xl border border-gray-700/60 overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(30,27,75,0.95) 100%)",
      }}
    >
      {/* Form header */}
      <div className="px-8 pt-8 pb-4 text-center">
        <div className="flex items-center gap-2 justify-center mb-2">
          <Image src="/logo.svg" alt="logo" width={28} height={28} />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            KNOVO
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white">
          Generate Your Personalized Quiz
        </h2>
      </div>

      {/* Form body */}
      <div className="px-8 pb-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-5 mt-4"
          >
            {/* Topic */}
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-300">
                    Quiz Topic
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter topic (e.g., Science, History)"
                      {...field}
                      onChange={handleTopicChange}
                      className="h-11 bg-gray-900/60 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-700/50" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Or
              </span>
              <div className="flex-1 h-px bg-gray-700/50" />
            </div>

            {/* PDF Upload */}
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-300">
                Upload a PDF
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    className="h-11 bg-gray-900/60 border-gray-700/50 text-gray-400 file:mr-4 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 focus:border-purple-500/50 rounded-xl"
                  />
                </div>
              </FormControl>
              {fileName && (
                <div className="flex items-center gap-2 mt-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400">{fileName}</span>
                </div>
              )}
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>

            {/* Quiz Type & Difficulty — side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-300">
                      Quiz Type
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-xl border border-gray-700/50 bg-gray-900/60 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
                      >
                        <option value="" className="bg-gray-900 text-white">
                          Select type
                        </option>
                        <option
                          value="true/false"
                          className="bg-gray-900 text-white"
                        >
                          True/False
                        </option>
                        <option
                          value="multiple choice"
                          className="bg-gray-900 text-white"
                        >
                          Multiple Choice
                        </option>
                        <option
                          value="verbal answer"
                          className="bg-gray-900 text-white"
                        >
                          Verbal Answer
                        </option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-300">
                      Difficulty
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-xl border border-gray-700/50 bg-gray-900/60 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
                      >
                        <option value="" className="bg-gray-900 text-white">
                          Select difficulty
                        </option>
                        <option value="easy" className="bg-gray-900 text-white">
                          Easy
                        </option>
                        <option
                          value="medium"
                          className="bg-gray-900 text-white"
                        >
                          Medium
                        </option>
                        <option value="hard" className="bg-gray-900 text-white">
                          Hard
                        </option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Number of Questions */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-300">
                    Number of Questions
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 7"
                      min="1"
                      max="20"
                      {...field}
                      className="h-11 bg-gray-900/60 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              className="w-full h-12 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.01]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Quiz…
                </div>
              ) : (
                "Generate Quiz"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default QuizForm;
