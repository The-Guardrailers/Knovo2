import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { languageScorecardSchema } from "@/constants/language";

export async function POST(req: NextRequest) {
    try {
        const { transcript, scenarioTitle, scenarioObjective } = await req.json();

        if (!transcript) {
            return NextResponse.json(
                { error: "Missing transcript" },
                { status: 400 }
            );
        }

        const prompt = `
You are an expert linguistics and language learning evaluator. Analyze the following voice-based roleplay scenario transcript and produce a structured scorecard for the user's performance.

**Scenario Title:** ${scenarioTitle || "Unknown"}
**Expected Objective:** ${scenarioObjective || "N/A"}

**Full Roleplay Transcript:**
${transcript}

---

### Scoring Dimensions

Evaluate across 4 dimensions, each scored 0-10. Every score MUST be backed by specific evidence from the transcript.

1. **Fluency (Weight: 25%)** — How smoothly the user conversed. Did they hesitate often or carry the conversation naturally?
2. **Grammar (Weight: 25%)** — Correct sentence structure, verb conjugations, and tense usage.
3. **Vocabulary (Weight: 25%)** — Variety of words used, correct application of context-specific words, absence of generic filler words.
4. **Pronunciation & Comprehension (Weight: 25%)** — Because we only have text transcriptions, evaluate this based on conversation flow: did the AI understand the user? Were there strange transcriptions that indicate poor pronunciation?

The overall score should be calculated as: (fluency * 0.25 + grammar * 0.25 + vocabulary * 0.25 + pronunciation * 0.25) * 10

Also provide:
- Key strengths (2-4 bullet points)
- Areas for improvement (2-4 bullet points)
- A final assessment paragraph summarizing their ability to meet the scenario objective in the target language.

CRITICAL: Every evidence statement must reference a specific moment or quote from the transcript. No vague claims without grounding.
`;

        const { object } = await generateObject({
            model: google("gemini-2.5-pro", {
                structuredOutputs: false,
            }),
            schema: languageScorecardSchema,
            prompt,
            system:
                "You are a world-class language learning evaluator producing evidence-backed scorecards for conversational roleplays.",
        });

        return NextResponse.json({ scorecard: object });
    } catch (error: any) {
        console.error("Scorecard generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate language scorecard", message: error.message },
            { status: 500 }
        );
    }
}
