import questionPacksData from "./questionPacks.json";

export interface QuestionPack {
  id: string;
  title: string;
  description: string;
  questions: string[];
}

export interface QuickFireQuestion {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
}

// Load question packs from JSON
export const questionPacks: QuestionPack[] = questionPacksData as QuestionPack[];

// Flatten all questions with proper IDs for backwards compatibility
export const quickFireQuestions: QuickFireQuestion[] = questionPacks.flatMap(
  (pack, packIndex) =>
    pack.questions.map((question, questionIndex) => ({
      id: `${pack.id}-${questionIndex + 1}`,
      category: pack.id,
      categoryLabel: pack.title,
      question,
    }))
);

// Category colors for visual distinction
export const categoryColors: Record<string, string> = {
  "vibe-check": "bg-purple-500/10 text-purple-600 border-purple-500/30",
  "human-element": "bg-amber-500/10 text-amber-600 border-amber-500/30",
  "marketing-mindset": "bg-blue-500/10 text-blue-600 border-blue-500/30",
};

// Get category color with fallback
export const getCategoryColor = (category: string): string => {
  return categoryColors[category] || "bg-muted text-muted-foreground border-border";
};
