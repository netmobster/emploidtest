export type Category = 'autonomy' | 'impact' | 'collaboration' | 'security' | 'recognition';

export interface QuestionOption {
  text: string;
  category: Category;
}

export interface Question {
  id: number;
  question: string;
  optionA: QuestionOption;
  optionB: QuestionOption;
}

export const questions: Question[] = [
  {
    id: 1,
    question: "When a deadline is looming, do you prefer:",
    optionA: { text: "Putting your head down to execute solo.", category: 'autonomy' },
    optionB: { text: "Rallying the team for a final push.", category: 'collaboration' },
  },
  {
    id: 2,
    question: "You've finished a project. What feels better?",
    optionA: { text: "A 'Great job!' from the boss in front of the group.", category: 'recognition' },
    optionB: { text: "Seeing the project live and knowing it fixed the problem.", category: 'impact' },
  },
  {
    id: 3,
    question: "Would you rather work for a company that is:",
    optionA: { text: "Highly structured with a predictable daily routine.", category: 'security' },
    optionB: { text: "Fast-moving where the mission changes based on results.", category: 'impact' },
  },
  {
    id: 4,
    question: "How do you prefer to receive a new assignment?",
    optionA: { text: "A detailed brief with clear steps and expectations.", category: 'security' },
    optionB: { text: "A high-level goal and the freedom to find the path.", category: 'autonomy' },
  },
  {
    id: 5,
    question: "If you have an idea for improvement, do you:",
    optionA: { text: "Prototype/test it yourself before telling anyone.", category: 'autonomy' },
    optionB: { text: "Pitch it to the group to see if they're excited too.", category: 'collaboration' },
  },
  {
    id: 6,
    question: "Which is more draining at work?",
    optionA: { text: "Being micro-managed on every small detail.", category: 'autonomy' },
    optionB: { text: "Feeling like your hard work is invisible to others.", category: 'recognition' },
  },
  {
    id: 7,
    question: "In a team setting, do you naturally gravitate toward:",
    optionA: { text: "Keeping the peace and ensuring everyone is aligned.", category: 'collaboration' },
    optionB: { text: "Pushing for a decision so the work can move forward.", category: 'impact' },
  },
  {
    id: 8,
    question: "Which benefit is more important to you?",
    optionA: { text: "Total flexibility of hours and location.", category: 'autonomy' },
    optionB: { text: "Strong health benefits and a long-term retirement plan.", category: 'security' },
  },
  {
    id: 9,
    question: "If the team fails, what is the most important first step?",
    optionA: { text: "Analyzing the process to ensure it doesn't happen again.", category: 'security' },
    optionB: { text: "Checking in with teammates to make sure everyone is okay.", category: 'collaboration' },
  },
  {
    id: 10,
    question: "Would you prefer to be known as:",
    optionA: { text: "The most reliable person on the team.", category: 'security' },
    optionB: { text: "The person who takes the biggest swings.", category: 'impact' },
  },
  {
    id: 11,
    question: "A critical decision needs to be made by EOD. How do you want to handle it?",
    optionA: { text: "Make the call myself based on my expertise and take full responsibility.", category: 'autonomy' },
    optionB: { text: "Call an emergency huddle to ensure every stakeholder feels heard before moving.", category: 'collaboration' },
  },
  {
    id: 12,
    question: "You are looking back on a year of work. What brings you more peace of mind?",
    optionA: { text: "Knowing your role is indispensable and your 40-hour week is protected.", category: 'security' },
    optionB: { text: "Having a portfolio of 'Big Wins' that you can show off to the industry.", category: 'recognition' },
  },
  {
    id: 13,
    question: "The company is pivoting. What is your first concern?",
    optionA: { text: "How this affects our daily workflows, documentation, and team structure.", category: 'security' },
    optionB: { text: "Whether the new direction still aligns with the mission I signed up for.", category: 'impact' },
  },
  {
    id: 14,
    question: "You've been offered a promotion. Which version do you choose?",
    optionA: { text: "A 'Senior' title with a seat at the leadership table and high internal visibility.", category: 'recognition' },
    optionB: { text: "A 'Principal' role with no direct reports but total freedom to work how/when you want.", category: 'autonomy' },
  },
  {
    id: 15,
    question: "You're facing a massive challenge. What is your preferred 'Vibe'?",
    optionA: { text: "A tight-knit 'squad' where no one succeeds unless everyone succeeds.", category: 'collaboration' },
    optionB: { text: "A high-pressure environment where 'Star Players' are expected to change the game.", category: 'impact' },
  },
];
