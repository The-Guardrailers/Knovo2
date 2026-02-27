import { NextRequest, NextResponse } from "next/server";
import { DSA_PROBLEMS, TestResult, ExecutionResult } from "@/constants/interview";

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

export async function POST(req: NextRequest) {
    try {
        const { code, problemId } = await req.json();

        if (!code || !problemId) {
            return NextResponse.json(
                { error: "Missing code or problemId" },
                { status: 400 }
            );
        }

        const problem = DSA_PROBLEMS.find((p) => p.id === problemId);
        if (!problem) {
            return NextResponse.json(
                { error: "Problem not found" },
                { status: 404 }
            );
        }

        const results: TestResult[] = [];

        for (const testCase of problem.testCases) {
            // Build a complete Python script: the candidate's code + a test invocation
            const fullCode = `${code}

# --- Test Runner ---
try:
    result = ${testCase.input}
    print(repr(result))
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
`;

            try {
                const response = await fetch(PISTON_API, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        language: "python",
                        version: "3.10.0",
                        files: [{ name: "solution.py", content: fullCode }],
                        run_timeout: 5000, // 5 second timeout
                    }),
                });

                if (!response.ok) {
                    results.push({
                        label: testCase.label,
                        caseType: testCase.caseType,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: "Execution service unavailable",
                        passed: false,
                        error: `Piston API returned ${response.status}`,
                    });
                    continue;
                }

                const data = await response.json();

                // Check for compile/runtime errors
                if (data.compile?.stderr) {
                    results.push({
                        label: testCase.label,
                        caseType: testCase.caseType,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: data.compile.stderr.trim(),
                        passed: false,
                        error: "Compilation error",
                    });
                    continue;
                }

                if (data.run?.stderr) {
                    results.push({
                        label: testCase.label,
                        caseType: testCase.caseType,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: data.run.stderr.trim(),
                        passed: false,
                        error: "Runtime error",
                    });
                    continue;
                }

                if (data.run?.signal === "SIGKILL" || data.run?.code !== 0) {
                    results.push({
                        label: testCase.label,
                        caseType: testCase.caseType,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: "TLE (Timed out)",
                        passed: false,
                        error: "Time limit exceeded",
                    });
                    continue;
                }

                const actualOutput = (data.run?.stdout || "").trim();
                const actualOutputNormalized = actualOutput.replace(/'/g, "");
                const expectedNormalized = testCase.expectedOutput.replace(/'/g, "");

                // Normalize comparison: handle list ordering for problems like Two Sum
                let passed = actualOutputNormalized === expectedNormalized;

                // Special handling: if sorting both as lists gives same answer
                if (!passed) {
                    try {
                        const actualParsed = JSON.parse(actualOutputNormalized.replace(/None/g, "null"));
                        const expectedParsed = JSON.parse(expectedNormalized.replace(/None/g, "null"));
                        if (Array.isArray(actualParsed) && Array.isArray(expectedParsed)) {
                            passed =
                                JSON.stringify(actualParsed.sort()) ===
                                JSON.stringify(expectedParsed.sort());
                        }
                    } catch {
                        // Not JSON — keep original comparison
                    }
                }

                results.push({
                    label: testCase.label,
                    caseType: testCase.caseType,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: actualOutput,
                    passed,
                });
            } catch (err: any) {
                results.push({
                    label: testCase.label,
                    caseType: testCase.caseType,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: "Execution failed",
                    passed: false,
                    error: err.message,
                });
            }
        }

        const executionResult: ExecutionResult = {
            passed: results.filter((r) => r.passed).length,
            total: results.length,
            results,
            hasError: results.some((r) => !!r.error),
        };

        return NextResponse.json(executionResult);
    } catch (error: any) {
        console.error("Execute code error:", error);
        return NextResponse.json(
            { error: "Internal server error", message: error.message },
            { status: 500 }
        );
    }
}
