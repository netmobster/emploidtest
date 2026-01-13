import { 
  Users, 
  Lightbulb, 
  Shield, 
  Heart, 
  Target,
  Coffee,
  MessageSquare,
  Award,
  Zap,
  Scale,
  Globe,
  PartyPopper,
  TrendingUp,
  Sparkles,
  LucideIcon
} from "lucide-react";

// Culture dimension structure for radar chart
export interface CultureDimension {
  name: string;
  value: number;
  fullMark: number;
}

// Individual culture preference
export interface CulturePreference {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  category: string;
}

// Culture category grouping
export interface CultureCategory {
  name: string;
  icon: LucideIcon;
  preferences: CulturePreference[];
}

// Map culture question IDs to readable labels and icons
const cultureQuestionMap: Record<string, { label: string; icon: LucideIcon; category: string }> = {
  "work-life-balance": { label: "Work-Life Balance", icon: Scale, category: "Work Environment" },
  "office-vibe": { label: "Office Vibe", icon: Coffee, category: "Work Environment" },
  "meeting-culture": { label: "Meeting Culture", icon: MessageSquare, category: "Work Environment" },
  "fun-factor": { label: "Fun Factor", icon: PartyPopper, category: "Work Environment" },
  "innovation-approach": { label: "Innovation Approach", icon: Lightbulb, category: "Growth & Development" },
  "leadership-style": { label: "Leadership Style", icon: Users, category: "Growth & Development" },
  "recognition-style": { label: "Recognition Style", icon: Award, category: "Growth & Development" },
  "failure-attitude": { label: "Failure Attitude", icon: TrendingUp, category: "Growth & Development" },
  "learning-investment": { label: "Learning Investment", icon: Sparkles, category: "Growth & Development" },
  "transparency-level": { label: "Transparency Level", icon: Globe, category: "Values & Policies" },
  "dei-commitment": { label: "DEI Commitment", icon: Heart, category: "Values & Policies" },
  "conflict-resolution": { label: "Conflict Resolution", icon: Shield, category: "Values & Policies" },
  "mission-importance": { label: "Mission Focus", icon: Target, category: "Values & Policies" },
  "decision-making": { label: "Decision Making", icon: Zap, category: "Values & Policies" },
  "social-activities": { label: "Social Activities", icon: Users, category: "Work Environment" },
};

// Convert culture preferences to radar chart dimensions
export function getCultureDimensions(
  preferences: Record<string, string> | null | undefined
): CultureDimension[] {
  if (!preferences) {
    return [
      { name: "Work-Life", value: 50, fullMark: 100 },
      { name: "Innovation", value: 50, fullMark: 100 },
      { name: "Transparency", value: 50, fullMark: 100 },
      { name: "Social", value: 50, fullMark: 100 },
      { name: "Mission", value: 50, fullMark: 100 },
    ];
  }

  // Calculate dimension scores based on preference values
  const dimensionScores = {
    "Work-Life": calculateDimensionScore(preferences, ["work-life-balance", "meeting-culture"]),
    "Innovation": calculateDimensionScore(preferences, ["innovation-approach", "failure-attitude", "learning-investment"]),
    "Transparency": calculateDimensionScore(preferences, ["transparency-level", "decision-making"]),
    "Social": calculateDimensionScore(preferences, ["social-activities", "fun-factor", "office-vibe"]),
    "Mission": calculateDimensionScore(preferences, ["mission-importance", "dei-commitment"]),
  };

  return Object.entries(dimensionScores).map(([name, value]) => ({
    name,
    value,
    fullMark: 100,
  }));
}

// Calculate a dimension score from multiple preferences
function calculateDimensionScore(
  preferences: Record<string, string>,
  keys: string[]
): number {
  const relevantPrefs = keys.filter(key => preferences[key]);
  if (relevantPrefs.length === 0) return 50;

  // Score based on preference strength (simplified - you can make this more sophisticated)
  let totalScore = 0;
  relevantPrefs.forEach(key => {
    const value = preferences[key];
    // Map preference values to scores
    totalScore += getPreferenceScore(value);
  });

  return Math.min(100, Math.max(0, Math.round(totalScore / relevantPrefs.length)));
}

// Map preference text to a numeric score
function getPreferenceScore(value: string): number {
  const lowValue = value.toLowerCase();
  
  // High intensity values
  if (lowValue.includes("very") || lowValue.includes("always") || lowValue.includes("mandatory") || lowValue.includes("high")) {
    return 90;
  }
  // Medium-high values
  if (lowValue.includes("regularly") || lowValue.includes("often") || lowValue.includes("encouraged")) {
    return 75;
  }
  // Medium values
  if (lowValue.includes("sometimes") || lowValue.includes("balanced") || lowValue.includes("moderate")) {
    return 60;
  }
  // Lower values
  if (lowValue.includes("rarely") || lowValue.includes("minimal") || lowValue.includes("flexible")) {
    return 45;
  }
  // Default
  return 65;
}

// Get icon for a culture category
export function getCultureCategoryIcon(category: string): LucideIcon {
  switch (category) {
    case "Work Environment":
      return Coffee;
    case "Growth & Development":
      return TrendingUp;
    case "Values & Policies":
      return Shield;
    default:
      return Sparkles;
  }
}

// Parse culture preferences into structured data
export function parseCulturePreferences(
  preferences: Record<string, string> | null | undefined
): CulturePreference[] {
  if (!preferences) return [];

  return Object.entries(preferences).map(([key, value]) => {
    const mapping = cultureQuestionMap[key] || {
      label: key.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      icon: Sparkles,
      category: "Other",
    };

    return {
      id: key,
      label: mapping.label,
      value: value,
      icon: mapping.icon,
      category: mapping.category,
    };
  });
}

// Group preferences by category
export function groupPreferencesByCategory(
  preferences: CulturePreference[]
): CultureCategory[] {
  const grouped = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, CulturePreference[]>);

  return Object.entries(grouped).map(([name, prefs]) => ({
    name,
    icon: getCultureCategoryIcon(name),
    preferences: prefs,
  }));
}

// Get color class based on category
export function getCultureCategoryColor(category: string): string {
  switch (category) {
    case "Work Environment":
      return "text-blue-500";
    case "Growth & Development":
      return "text-green-500";
    case "Values & Policies":
      return "text-purple-500";
    default:
      return "text-primary";
  }
}

// Get background color class based on category
export function getCultureCategoryBgColor(category: string): string {
  switch (category) {
    case "Work Environment":
      return "bg-blue-500/10";
    case "Growth & Development":
      return "bg-green-500/10";
    case "Values & Policies":
      return "bg-purple-500/10";
    default:
      return "bg-primary/10";
  }
}

// Calculate culture compatibility between two users
export function calculateCultureCompatibility(
  userPreferences: Record<string, string> | null | undefined,
  otherPreferences: Record<string, string> | null | undefined
): { score: number; matchingAreas: string[]; differingAreas: string[] } {
  if (!userPreferences || !otherPreferences) {
    return { score: 0, matchingAreas: [], differingAreas: [] };
  }

  const userDimensions = getCultureDimensions(userPreferences);
  const otherDimensions = getCultureDimensions(otherPreferences);
  
  const matchingAreas: string[] = [];
  const differingAreas: string[] = [];
  let totalDiff = 0;
  let count = 0;

  userDimensions.forEach((userDim, index) => {
    const otherDim = otherDimensions[index];
    if (otherDim) {
      const diff = Math.abs(userDim.value - otherDim.value);
      totalDiff += diff;
      count++;
      
      if (diff <= 15) {
        matchingAreas.push(userDim.name);
      } else if (diff >= 30) {
        differingAreas.push(userDim.name);
      }
    }
  });

  // Also compare individual preferences
  const sharedKeys = Object.keys(userPreferences).filter(key => otherPreferences[key]);
  sharedKeys.forEach(key => {
    if (userPreferences[key] === otherPreferences[key]) {
      const mapping = cultureQuestionMap[key];
      if (mapping && !matchingAreas.includes(mapping.label)) {
        // Add to matching if exact match
      }
    }
  });

  // Calculate compatibility score (100 - average difference)
  const avgDiff = count > 0 ? totalDiff / count : 50;
  const score = Math.max(0, Math.min(100, Math.round(100 - avgDiff)));

  return { score, matchingAreas, differingAreas };
}

// Get compatibility label based on score
export function getCultureCompatibilityLabel(score: number): string {
  if (score >= 85) return "Excellent Match";
  if (score >= 70) return "Strong Match";
  if (score >= 55) return "Good Match";
  if (score >= 40) return "Moderate Match";
  return "Different Styles";
}

// Get compatibility color based on score
export function getCultureCompatibilityColor(score: number): string {
  if (score >= 85) return "text-green-500";
  if (score >= 70) return "text-emerald-500";
  if (score >= 55) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

// Get compatibility background based on score
export function getCultureCompatibilityBg(score: number): string {
  if (score >= 85) return "bg-green-500/10 border-green-500/20";
  if (score >= 70) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 55) return "bg-yellow-500/10 border-yellow-500/20";
  if (score >= 40) return "bg-orange-500/10 border-orange-500/20";
  return "bg-red-500/10 border-red-500/20";
}
