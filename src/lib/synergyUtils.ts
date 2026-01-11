import { Category } from '@/data/questions';

/**
 * Calculate synergy compatibility score between two users based on their synergy scores
 * Returns a percentage (0-100) indicating how compatible their work styles are
 */
export const calculateSynergyCompatibility = (
  scores1: Record<string, number> | null | undefined,
  scores2: Record<string, number> | null | undefined
): number => {
  if (!scores1 || !scores2) {
    return 0; // No compatibility can be calculated without scores
  }

  const categories: Category[] = ['autonomy', 'impact', 'collaboration', 'security', 'recognition'];
  
  let totalDifference = 0;
  let comparableCategories = 0;

  categories.forEach((category) => {
    const score1 = scores1[category];
    const score2 = scores2[category];

    if (score1 !== undefined && score2 !== undefined) {
      // Calculate the absolute difference (max difference is 10 per category)
      const difference = Math.abs(score1 - score2);
      totalDifference += difference;
      comparableCategories++;
    }
  });

  if (comparableCategories === 0) {
    return 0;
  }

  // Max possible difference per category is 10, so max total is comparableCategories * 10
  const maxPossibleDifference = comparableCategories * 10;
  
  // Convert difference to compatibility percentage
  // Lower difference = higher compatibility
  const compatibility = Math.round(((maxPossibleDifference - totalDifference) / maxPossibleDifference) * 100);
  
  // Scale to 50-100 range for more meaningful display (no one wants to see 20% compatibility)
  const scaledCompatibility = Math.round(50 + (compatibility * 0.5));
  
  return Math.min(100, Math.max(50, scaledCompatibility));
};

/**
 * Get a human-readable label for a compatibility score
 */
export const getCompatibilityLabel = (score: number): string => {
  if (score >= 90) return "Excellent Match";
  if (score >= 80) return "Great Match";
  if (score >= 70) return "Good Match";
  if (score >= 60) return "Fair Match";
  return "Needs Exploration";
};

/**
 * Get the color class for a compatibility score
 */
export const getCompatibilityColor = (score: number): string => {
  if (score >= 90) return "text-green-500";
  if (score >= 80) return "text-emerald-500";
  if (score >= 70) return "text-yellow-500";
  if (score >= 60) return "text-orange-500";
  return "text-red-500";
};
