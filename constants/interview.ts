import z from "zod";

// ── Problem Library ─────────────────────────────────────────────────────

export interface TestCase {
    input: string;
    expectedOutput: string;
    caseType: "basic" | "edge" | "stress";
    label: string;
}

export interface DSAProblem {
    id: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
    statement: string;
    constraints: string;
    testCases: TestCase[];
    optimalTimeComplexity: string;
    optimalSpaceComplexity: string;
    starterCode: string;
    testCasesSummary: string;
}

export const DSA_PROBLEMS: DSAProblem[] = [
    {
        id: "two-sum",
        title: "Two Sum",
        difficulty: "easy",
        statement:
            "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
        constraints:
            "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9. Only one valid answer exists.",
        optimalTimeComplexity: "O(n)",
        optimalSpaceComplexity: "O(n)",
        starterCode: `from typing import List

def twoSum(nums: List[int], target: int) -> List[int]:
    # Write your solution here
    pass
`,
        testCasesSummary:
            "5 test cases: 2 basic (standard arrays), 2 edge (duplicates, negative numbers), 1 stress (10k elements).",
        testCases: [
            {
                input: "twoSum([2,7,11,15], 9)",
                expectedOutput: "[0,1]",
                caseType: "basic",
                label: "Basic case",
            },
            {
                input: "twoSum([3,3], 6)",
                expectedOutput: "[0,1]",
                caseType: "basic",
                label: "Duplicate values",
            },
            {
                input: "twoSum([1,2], 4)",
                expectedOutput: "None",
                caseType: "edge",
                label: "Empty-ish input",
            },
            {
                input: "twoSum([-3,4,3,90], 0)",
                expectedOutput: "[0,2]",
                caseType: "edge",
                label: "Negative numbers",
            },
            {
                input: "twoSum(list(range(10000)), 19997)",
                expectedOutput: "[9998,9999]",
                caseType: "stress",
                label: "Stress: 10k elements",
            },
        ],
    },
    {
        id: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "easy",
        statement:
            "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
        constraints: "1 <= s.length <= 10^4, s consists of parentheses only '()[]{}'.",
        optimalTimeComplexity: "O(n)",
        optimalSpaceComplexity: "O(n)",
        starterCode: `def isValid(s: str) -> bool:
    # Write your solution here
    pass
`,
        testCasesSummary:
            "5 test cases: 2 basic (simple valid/invalid), 2 edge (empty string, single char), 1 stress (nested 5k pairs).",
        testCases: [
            {
                input: 'isValid("()")',
                expectedOutput: "True",
                caseType: "basic",
                label: "Simple valid",
            },
            {
                input: 'isValid("()[]{}")',
                expectedOutput: "True",
                caseType: "basic",
                label: "Mixed valid",
            },
            {
                input: 'isValid("(]")',
                expectedOutput: "False",
                caseType: "edge",
                label: "Mismatched",
            },
            {
                input: 'isValid("")',
                expectedOutput: "True",
                caseType: "edge",
                label: "Empty string",
            },
            {
                input: 'isValid("(" * 5000 + ")" * 5000)',
                expectedOutput: "True",
                caseType: "stress",
                label: "Stress: 10k chars",
            },
        ],
    },
    {
        id: "merge-sorted-lists",
        title: "Merge Two Sorted Lists",
        difficulty: "easy",
        statement:
            "You are given two sorted linked lists. Merge them into one sorted list by splicing together the nodes. For this problem, use simple Python lists instead of linked list nodes. Given two sorted lists list1 and list2, return a single sorted merged list.",
        constraints:
            "0 <= list1.length, list2.length <= 50, -100 <= list1[i], list2[i] <= 100. Both lists are sorted in non-decreasing order.",
        optimalTimeComplexity: "O(n + m)",
        optimalSpaceComplexity: "O(n + m)",
        starterCode: `from typing import List

def mergeTwoLists(list1: List[int], list2: List[int]) -> List[int]:
    # Write your solution here
    pass
`,
        testCasesSummary:
            "5 test cases: 2 basic (standard merges), 2 edge (empty lists, single elements), 1 stress (large lists).",
        testCases: [
            {
                input: "mergeTwoLists([1,2,4], [1,3,4])",
                expectedOutput: "[1,1,2,3,4,4]",
                caseType: "basic",
                label: "Basic merge",
            },
            {
                input: "mergeTwoLists([1,3,5], [2,4,6])",
                expectedOutput: "[1,2,3,4,5,6]",
                caseType: "basic",
                label: "Interleaved",
            },
            {
                input: "mergeTwoLists([], [])",
                expectedOutput: "[]",
                caseType: "edge",
                label: "Both empty",
            },
            {
                input: "mergeTwoLists([], [0])",
                expectedOutput: "[0]",
                caseType: "edge",
                label: "One empty",
            },
            {
                input: "mergeTwoLists(list(range(0,100,2)), list(range(1,100,2)))",
                expectedOutput: "list(range(100))",
                caseType: "stress",
                label: "Stress: 100 elements",
            },
        ],
    },
    {
        id: "maximum-subarray",
        title: "Maximum Subarray",
        difficulty: "medium",
        statement:
            "Given an integer array nums, find the subarray with the largest sum, and return its sum. A subarray is a contiguous non-empty sequence of elements within an array.",
        constraints:
            "1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4.",
        optimalTimeComplexity: "O(n)",
        optimalSpaceComplexity: "O(1)",
        starterCode: `from typing import List

def maxSubArray(nums: List[int]) -> int:
    # Write your solution here
    pass
`,
        testCasesSummary:
            "5 test cases: 2 basic (mixed positive/negative), 2 edge (single element, all negative), 1 stress (large array).",
        testCases: [
            {
                input: "maxSubArray([-2,1,-3,4,-1,2,1,-5,4])",
                expectedOutput: "6",
                caseType: "basic",
                label: "Basic mixed",
            },
            {
                input: "maxSubArray([5,4,-1,7,8])",
                expectedOutput: "23",
                caseType: "basic",
                label: "Mostly positive",
            },
            {
                input: "maxSubArray([1])",
                expectedOutput: "1",
                caseType: "edge",
                label: "Single element",
            },
            {
                input: "maxSubArray([-1,-2,-3])",
                expectedOutput: "-1",
                caseType: "edge",
                label: "All negative",
            },
            {
                input: "maxSubArray(list(range(-5000,5000)))",
                expectedOutput: "12497500",
                caseType: "stress",
                label: "Stress: 10k elements",
            },
        ],
    },
    {
        id: "binary-search",
        title: "Binary Search",
        difficulty: "easy",
        statement:
            "Given a sorted array of integers nums and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
        constraints:
            "1 <= nums.length <= 10^4, -10^4 < nums[i], target < 10^4. All the integers in nums are unique. nums is sorted in ascending order.",
        optimalTimeComplexity: "O(log n)",
        optimalSpaceComplexity: "O(1)",
        starterCode: `from typing import List

def search(nums: List[int], target: int) -> int:
    # Write your solution here
    pass
`,
        testCasesSummary:
            "5 test cases: 2 basic (found/not found), 2 edge (single element, first/last element), 1 stress (10k elements).",
        testCases: [
            {
                input: "search([-1,0,3,5,9,12], 9)",
                expectedOutput: "4",
                caseType: "basic",
                label: "Found in middle",
            },
            {
                input: "search([-1,0,3,5,9,12], 2)",
                expectedOutput: "-1",
                caseType: "basic",
                label: "Not found",
            },
            {
                input: "search([5], 5)",
                expectedOutput: "0",
                caseType: "edge",
                label: "Single element found",
            },
            {
                input: "search([1,2,3,4,5], 1)",
                expectedOutput: "0",
                caseType: "edge",
                label: "First element",
            },
            {
                input: "search(list(range(10000)), 9999)",
                expectedOutput: "9999",
                caseType: "stress",
                label: "Stress: 10k elements",
            },
        ],
    },
];

// ── Difficulty Config ───────────────────────────────────────────────────

export type AggressionLevel = "Light" | "Standard" | "Aggressive";
export type HintTolerance = "None" | "Scaffolded";

export interface DifficultyConfig {
    aggressionLevel: AggressionLevel;
    hintTolerance: HintTolerance;
}

// ── Scorecard Schema ────────────────────────────────────────────────────

export const interviewScorecardSchema = z.object({
    correctnessScore: z.number().min(0).max(10),
    correctnessEvidence: z.string(),
    reasoningScore: z.number().min(0).max(10),
    reasoningEvidence: z.string(),
    debuggingScore: z.number().min(0).max(10),
    debuggingEvidence: z.string(),
    clarityScore: z.number().min(0).max(10),
    clarityEvidence: z.string(),
    overallScore: z.number().min(0).max(100),
    behavioralSummary: z.string(),
    strengths: z.array(z.string()),
    areasForImprovement: z.array(z.string()),
    finalAssessment: z.string(),
});

export type InterviewScorecard = z.infer<typeof interviewScorecardSchema>;

// ── Test Result Types ───────────────────────────────────────────────────

export interface TestResult {
    label: string;
    caseType: "basic" | "edge" | "stress";
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    error?: string;
}

export interface ExecutionResult {
    passed: number;
    total: number;
    results: TestResult[];
    hasError: boolean;
    errorMessage?: string;
}
