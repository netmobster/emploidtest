import { Category } from '@/data/questions';

export interface MatchScoreBreakdown {
  skillScore: number;
  cultureScore: number;
  synergyScore: number;
  totalScore: number;
}

// Weights for match score calculation
const WEIGHTS = {
  skill: 0.4,    // 40%
  culture: 0.3,  // 30%
  synergy: 0.3,  // 30%
};

/**
 * Calculate skill match score based on matching skills
 * Returns a percentage (0-100)
 */
export const calculateSkillScore = (
  candidateSkills: string[] | null,
  jobRequirements: string[] | null
): number => {
  if (!candidateSkills?.length || !jobRequirements?.length) {
    return 50; // Default score when no data
  }

  const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase().trim());
  const normalizedRequirements = jobRequirements.map(r => r.toLowerCase().trim());

  const matchingSkills = normalizedCandidateSkills.filter(skill =>
    normalizedRequirements.some(req => 
      req.includes(skill) || skill.includes(req)
    )
  );

  const matchPercentage = (matchingSkills.length / normalizedRequirements.length) * 100;
  return Math.min(100, Math.round(matchPercentage));
};

/**
 * Calculate culture match score based on culture preferences
 * Returns a percentage (0-100)
 */
export const calculateCultureScore = (
  profile1Preferences: Record<string, number> | null,
  profile2Preferences: Record<string, number> | null
): number => {
  if (!profile1Preferences || !profile2Preferences) {
    return 50; // Default score when no data
  }

  const keys = Object.keys(profile1Preferences);
  if (keys.length === 0) return 50;

  let totalDifference = 0;
  let comparableKeys = 0;

  keys.forEach(key => {
    const val1 = profile1Preferences[key];
    const val2 = profile2Preferences[key];
    
    if (val1 !== undefined && val2 !== undefined) {
      // Assuming values are 0-10, max difference is 10
      const difference = Math.abs(val1 - val2);
      totalDifference += difference;
      comparableKeys++;
    }
  });

  if (comparableKeys === 0) return 50;

  const maxPossibleDifference = comparableKeys * 10;
  const compatibility = ((maxPossibleDifference - totalDifference) / maxPossibleDifference) * 100;
  
  return Math.round(compatibility);
};

/**
 * Calculate synergy score compatibility between two users
 * Returns a percentage (0-100)
 */
export const calculateSynergyScore = (
  scores1: Record<string, number> | null,
  scores2: Record<string, number> | null
): number => {
  if (!scores1 || !scores2) {
    return 50; // Default when no synergy data
  }

  const categories: Category[] = ['autonomy', 'impact', 'collaboration', 'security', 'recognition'];
  
  let totalDifference = 0;
  let comparableCategories = 0;

  categories.forEach((category) => {
    const score1 = scores1[category];
    const score2 = scores2[category];

    if (score1 !== undefined && score2 !== undefined) {
      const difference = Math.abs(score1 - score2);
      totalDifference += difference;
      comparableCategories++;
    }
  });

  if (comparableCategories === 0) return 50;

  const maxPossibleDifference = comparableCategories * 10;
  const compatibility = ((maxPossibleDifference - totalDifference) / maxPossibleDifference) * 100;
  
  return Math.round(compatibility);
};

/**
 * Calculate the complete match score with breakdown
 */
export const calculateMatchScore = (
  candidateProfile: {
    skills?: string[] | null;
    culture_preferences?: Record<string, number> | null;
    synergy_scores?: Record<string, number> | null;
  } | null,
  employerProfile: {
    culture_preferences?: Record<string, number> | null;
    synergy_scores?: Record<string, number> | null;
  } | null,
  jobData?: {
    requirements?: string[] | null;
    culture_preferences?: Record<string, number> | null;
    skills_preferences?: Record<string, number> | null;
  } | null
): MatchScoreBreakdown => {
  // Calculate individual scores
  const skillScore = calculateSkillScore(
    candidateProfile?.skills || null,
    jobData?.requirements || null
  );

  const cultureScore = calculateCultureScore(
    candidateProfile?.culture_preferences || null,
    employerProfile?.culture_preferences || jobData?.culture_preferences || null
  );

  const synergyScore = calculateSynergyScore(
    candidateProfile?.synergy_scores || null,
    employerProfile?.synergy_scores || null
  );

  // Calculate weighted total
  const totalScore = Math.round(
    skillScore * WEIGHTS.skill +
    cultureScore * WEIGHTS.culture +
    synergyScore * WEIGHTS.synergy
  );

  return {
    skillScore,
    cultureScore,
    synergyScore,
    totalScore,
  };
};

/**
 * Get color class based on score
 */
export const getScoreColor = (score: number): string => {
  if (score >= 85) return "text-green-500";
  if (score >= 70) return "text-emerald-500";
  if (score >= 55) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
};

/**
 * Get background color class based on score
 */
export const getScoreBgColor = (score: number): string => {
  if (score >= 85) return "bg-green-500";
  if (score >= 70) return "bg-emerald-500";
  if (score >= 55) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
};

/**
 * Get label for match score
 */
export const getMatchLabel = (score: number): string => {
  if (score >= 85) return "Excellent Match";
  if (score >= 70) return "Great Match";
  if (score >= 55) return "Good Match";
  if (score >= 40) return "Fair Match";
  return "Needs Exploration";
};
