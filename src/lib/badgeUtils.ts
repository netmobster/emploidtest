import { Category } from '@/data/questions';
import { badges, Badge } from '@/data/badges';

export function getPrimaryBadge(scores: Record<string, number> | null): Badge | null {
  if (!scores || Object.keys(scores).length === 0) return null;
  
  const maxScore = Math.max(...Object.values(scores));
  const topCategory = Object.entries(scores).find(
    ([_, value]) => value === maxScore
  )?.[0] as Category;
  
  return topCategory ? badges[topCategory] : null;
}
