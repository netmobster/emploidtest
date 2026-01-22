export interface QuickFireQuestion {
  id: string;
  category: "vibe-check" | "human-element" | "mindset";
  categoryLabel: string;
  question: string;
}

export const quickFireQuestions: QuickFireQuestion[] = [
  // Vibe Check - Culture & Environment
  {
    id: "vibe-1",
    category: "vibe-check",
    categoryLabel: "Vibe Check",
    question: "What's the one 'unspoken rule' for a perfect remote workday in your world?",
  },
  {
    id: "vibe-2",
    category: "vibe-check",
    categoryLabel: "Vibe Check",
    question: "If you had to pick a soundtrack for when you're in deep-focus mode, what's playing?",
  },
  {
    id: "vibe-3",
    category: "vibe-check",
    categoryLabel: "Vibe Check",
    question: "What's a professional 'hill' you are willing to die on? (e.g., 'Meetings should never be more than 30 minutes')",
  },
  // Human Element - Personality & Quirks
  {
    id: "human-1",
    category: "human-element",
    categoryLabel: "Human Element",
    question: "What is a hobby or interest you've pursued that has absolutely nothing to do with your career?",
  },
  {
    id: "human-2",
    category: "human-element",
    categoryLabel: "Human Element",
    question: "You have a surprise 3-hour block of free time tomorrow. What are you doing with it?",
  },
  {
    id: "human-3",
    category: "human-element",
    categoryLabel: "Human Element",
    question: "What's the best piece of non-career advice you've ever actually followed?",
  },
  // Marketing Mindset - Strategic Leanings
  {
    id: "mindset-1",
    category: "mindset",
    categoryLabel: "Strategic Mindset",
    question: "What's one industry trend or 'growth hack' that you think is total noise right now?",
  },
  {
    id: "mindset-2",
    category: "mindset",
    categoryLabel: "Strategic Mindset",
    question: "If you could only use one social platform for the rest of your career, which one wins and why?",
  },
  {
    id: "mindset-3",
    category: "mindset",
    categoryLabel: "Strategic Mindset",
    question: "What was the last 'win' that made you genuinely excited to get to work the next day?",
  },
];

export const categoryColors: Record<string, string> = {
  "vibe-check": "bg-purple-500/10 text-purple-600 border-purple-500/30",
  "human-element": "bg-amber-500/10 text-amber-600 border-amber-500/30",
  "mindset": "bg-blue-500/10 text-blue-600 border-blue-500/30",
};
