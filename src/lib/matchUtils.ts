// Match score calculation utility
// Compares preferences between candidates and jobs/employers

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Preferences = Record<string, string> | any;

/**
 * Calculate match score between two sets of preferences
 * Returns a score from 0-100
 */
export const calculateMatchScore = (
  preferences1: Preferences | null | undefined,
  preferences2: Preferences | null | undefined
): number => {
  // If either has no preferences, return a base score
  if (!preferences1 || !preferences2) {
    return 65; // Base score when preferences aren't available
  }

  // Get all unique keys from both preference sets
  const allKeys = new Set([
    ...Object.keys(preferences1),
    ...Object.keys(preferences2),
  ]);

  if (allKeys.size === 0) {
    return 65; // Base score when no preferences exist
  }

  let matchingAnswers = 0;
  let comparableQuestions = 0;

  allKeys.forEach((key) => {
    const answer1 = preferences1[key];
    const answer2 = preferences2[key];

    // Only count if both have answered the question
    if (answer1 && answer2) {
      comparableQuestions++;
      
      // Exact match
      if (answer1 === answer2) {
        matchingAnswers += 1;
      } 
      // Partial match for similar answers (fuzzy matching)
      else if (areAnswersSimilar(key, answer1, answer2)) {
        matchingAnswers += 0.5;
      }
    }
  });

  // If no comparable questions, return base score
  if (comparableQuestions === 0) {
    return 65;
  }

  // Calculate percentage and scale to 60-100 range (no one wants to see low scores)
  const rawScore = (matchingAnswers / comparableQuestions) * 100;
  const scaledScore = Math.round(60 + (rawScore * 0.4));
  
  return Math.min(100, Math.max(60, scaledScore));
};

/**
 * Check if two answers are similar (fuzzy matching for related options)
 */
const areAnswersSimilar = (questionId: string, answer1: string, answer2: string): boolean => {
  // Define answer groups that are considered similar
  const similarityGroups: Record<string, string[][]> = {
    // Work arrangement similarity
    "work-arrangement": [
      ["Fully Remote", "Remote", "Flexible"],
      ["Hybrid (2-3 days)", "Hybrid", "Flexible"],
    ],
    // Experience level (adjacent levels are somewhat similar)
    "experience-level": [
      ["Entry Level (0-2 years)", "Mid Level (3-5 years)"],
      ["Mid Level (3-5 years)", "Senior (6-10 years)"],
      ["Senior (6-10 years)", "Executive (10+ years)"],
    ],
    // Company stage
    "company-stage": [
      ["Seed/Early Stage", "Series A/B"],
      ["Series A/B", "Series C/D"],
      ["Series C/D", "Public/Enterprise"],
    ],
    // Work-life balance
    "work-life-balance": [
      ["Balanced", "Family-First"],
      ["Intense (Startup Hours)", "Results-Only"],
    ],
    // Leadership style
    "leadership-style": [
      ["Servant Leadership", "Coaching & Mentoring"],
      ["Hands-Off Autonomy", "Results-Only"],
    ],
    // Office vibe
    "office-vibe": [
      ["Casual & Fun", "Social & Lively"],
      ["Quiet & Focused", "Professional & Polished"],
    ],
    // Transparency
    "transparency": [
      ["Open Book (Full)", "Selective Sharing"],
    ],
    // Innovation
    "innovation": [
      ["Move Fast, Break Things", "Experimental"],
      ["Measured & Tested", "Conservative & Proven"],
    ],
    // Remote preference matching
    "remote": [
      ["Remote", "Flexible"],
      ["Hybrid", "Flexible"],
    ],
    // Availability matching
    "availability": [
      ["Immediately", "2 weeks"],
      ["2 weeks", "1 month"],
      ["1 month", "Flexible"],
    ],
  };

  const groups = similarityGroups[questionId];
  if (!groups) return false;

  return groups.some(
    (group) => group.includes(answer1) && group.includes(answer2)
  );
};

/**
 * Calculate combined match score from skills and culture preferences
 */
export const calculateCombinedMatchScore = (
  skillsPrefs1: Preferences | null | undefined,
  skillsPrefs2: Preferences | null | undefined,
  culturePrefs1: Preferences | null | undefined,
  culturePrefs2: Preferences | null | undefined,
  skillsWeight: number = 0.4,
  cultureWeight: number = 0.6
): number => {
  const skillsScore = calculateMatchScore(skillsPrefs1, skillsPrefs2);
  const cultureScore = calculateMatchScore(culturePrefs1, culturePrefs2);

  return Math.round(skillsScore * skillsWeight + cultureScore * cultureWeight);
};

/**
 * Calculate match score for a candidate based on job preferences
 */
export const calculateCandidateMatchScore = (
  candidateProfile: {
    culture_preferences?: Preferences | null;
    skills_preferences?: Preferences | null;
  } | null,
  jobOrEmployerPrefs: {
    culture_preferences?: Preferences | null;
    skills_preferences?: Preferences | null;
  } | null
): number => {
  if (!candidateProfile && !jobOrEmployerPrefs) {
    return 70 + Math.floor(Math.random() * 20); // Random 70-90 as fallback
  }

  return calculateCombinedMatchScore(
    candidateProfile?.skills_preferences as Preferences,
    jobOrEmployerPrefs?.skills_preferences as Preferences,
    candidateProfile?.culture_preferences as Preferences,
    jobOrEmployerPrefs?.culture_preferences as Preferences
  );
};

/**
 * Calculate match score for a job based on candidate preferences
 */
export const calculateJobMatchScore = (
  candidatePrefs: {
    culture_preferences?: Preferences | null;
    skills_preferences?: Preferences | null;
  } | null,
  job: {
    culture_preferences?: Preferences | null;
    skills_preferences?: Preferences | null;
  } | null
): number => {
  if (!candidatePrefs && !job) {
    return 70 + Math.floor(Math.random() * 20); // Random 70-90 as fallback
  }

  return calculateCombinedMatchScore(
    candidatePrefs?.skills_preferences as Preferences,
    job?.skills_preferences as Preferences,
    candidatePrefs?.culture_preferences as Preferences,
    job?.culture_preferences as Preferences
  );
};
