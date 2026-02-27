import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { interviewScorecardSchema } from "@/constants/interview";

export async function POST(req: NextRequest) {
    try {
        const { transcript, testSummary, problemTitle, code } = await req.json();

        if (!transcript) {
            return NextResponse.json(
                { error: "Missing transcript" },
                { status: 400 }
            );
        }

        const prompt = `
You are an expert technical interview evaluator. Analyze the following voice-based technical interview session and produce a structured scorecard.

**Problem:** ${problemTitle || "Unknown"}

**Candidate's Final Code:**
\`\`\`python
${code || "No code submitted"}
\`\`\`

**Test Execution Results:** ${testSummary || "No tests run"}

**Full Interview Transcript:**
${transcript}

---

### Scoring Dimensions

Evaluate across 4 dimensions, each scored 0-10. Every score MUST be backed by specific evidence from the transcript or test results.

1. **Correctness (Weight: 30%)** — Based on test case pass rate, code accuracy, handling of edge cases.
2. **Algorithmic Reasoning (Weight: 30%)** — Approach optimality, data structure justification, complexity analysis accuracy, whether they addressed time AND space complexity.
3. **Debugging Ability (Weight: 20%)** — How they handled test failures, quality of debugging reasoning, number of iterations needed.
4. **Communication Clarity (Weight: 20%)** — Structured explanation flow (approach → implementation → complexity), low filler word rate, checkpoint completeness, ability to defend decisions.

The overall score should be calculated as: (correctness * 0.3 + reasoning * 0.3 + debugging * 0.2 + clarity * 0.2) * 10

Also provide:
- A behavioral summary from the HR round portion of the interview
- Key strengths (2-4 bullet points)
- Areas for improvement (2-4 bullet points)
- A final assessment paragraph

CRITICAL: Every evidence statement must reference a specific moment from the transcript or a concrete test result. No vague claims like "good code quality" without grounding.
`;

        const { object } = await generateObject({
            model: google("gemini-2.5-pro", {
                structuredOutputs: false,
            }),
            schema: interviewScorecardSchema,
            prompt,
            system:
                "You are a world-class technical interview evaluator producing evidence-backed scorecards for coding interviews.",
        });

        return NextResponse.json({ scorecard: object });
    } catch (error: any) {
        console.error("Scorecard generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate scorecard", message: error.message },
            { status: 500 }
        );
    }
}
