import z from "zod";

// ── Scenario Library ────────────────────────────────────────────────────

export interface LanguageScenario {
    id: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
    objective: string;
    context: string;
    keyVocabulary: string[];
}

export const LANGUAGE_SCENARIOS: LanguageScenario[] = [
    {
        id: "proficiency-test",
        title: "Language Proficiency Test",
        difficulty: "hard",
        objective: "Demonstrate conversational fluency, advanced vocabulary, and strong grammar across a wide range of spontaneous topics.",
        context: "You are sitting for a spoken language proficiency exam. The examiner will ask you about your background, opinions on current events, and ask you to describe a complex situation.",
        keyVocabulary: ["opinion", "experience", "describe", "analyze", "perspective", "fluent", "elaborate", "proficient"]
    },
    {
        id: "restaurant-ordering",
        title: "Dining at a Restaurant",
        difficulty: "easy",
        objective: "Order a 3-course meal, ask about dietary restrictions, and handle a minor issue with the bill.",
        context: "You are at a fine dining restaurant. You need to ask the waiter about gluten-free options, order your meal, and later politely point out an error on your check.",
        keyVocabulary: ["appetizer", "entree", "dessert", "gluten-free", "recommendation", "bill", "check", "overcharged"]
    },
    {
        id: "travel-customs",
        title: "Airport Customs & Immigration",
        difficulty: "medium",
        objective: "Answer the immigration officer's questions about your trip purpose, duration, and declare any items.",
        context: "You have just landed in a foreign country. You are speaking to a border control officer who needs to verify your travel plans, accommodation, and luggage contents.",
        keyVocabulary: ["purpose of visit", "duration", "accommodation", "declare", "itinerary", "return ticket", "luggage"]
    },
    {
        id: "debate-technology",
        title: "Debating AI in Education",
        difficulty: "hard",
        objective: "Articulate and defend your stance on whether artificial intelligence should be widely integrated into school curricula.",
        context: "You are participating in a civilized debate with a peer. They hold a skeptical view on AI in schools, citing cheating and lack of creativity. You must argue your perspective clearly.",
        keyVocabulary: ["integration", "plagiarism", "critical thinking", "efficiency", "curriculum", "ethical", "perspective"]
    },
    {
        id: "casual-friend",
        title: "Catching Up with a Friend",
        difficulty: "easy",
        objective: "Have a casual conversation with an old friend you haven't seen in a year. Discuss hobbies, work, and make future plans.",
        context: "You bumped into an old college friend at a coffee shop. Catch up on each other's lives, talk about what you've been doing recently, and arrange to meet up again.",
        keyVocabulary: ["long time no see", "catch up", "up to lately", "hobbies", "hang out", "get together", "keep in touch"]
    }
];

// ── Difficulty Config ───────────────────────────────────────────────────

export type StrictnessLevel = "Lenient" | "Moderate" | "Strict";
export type PacingLevel = "Slow" | "Normal" | "Fast";

export interface LanguageDifficultyConfig {
    strictnessLevel: StrictnessLevel;
    pacingLevel: PacingLevel;
}

// ── Scorecard Schema ────────────────────────────────────────────────────

export const languageScorecardSchema = z.object({
    fluencyScore: z.number().min(0).max(10),
    fluencyEvidence: z.string(),
    grammarScore: z.number().min(0).max(10),
    grammarEvidence: z.string(),
    vocabularyScore: z.number().min(0).max(10),
    vocabularyEvidence: z.string(),
    pronunciationScore: z.number().min(0).max(10), // Evaluated based on conversational flow / transcription accuracy proxy
    pronunciationEvidence: z.string(),
    overallScore: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    areasForImprovement: z.array(z.string()),
    finalAssessment: z.string(),
});

export type LanguageScorecard = z.infer<typeof languageScorecardSchema>;
