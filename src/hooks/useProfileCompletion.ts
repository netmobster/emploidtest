import { useMemo } from "react";

interface Profile {
  full_name: string | null;
  job_title: string | null;
  location: string | null;
  bio: string | null;
  company_name: string | null;
  company_location: string | null;
  company_industry: string | null;
  has_completed_profile: boolean;
  has_completed_culture_game: boolean;
  has_completed_extended_profile: boolean;
  has_completed_work_love_language: boolean;
  has_completed_manager_profile: boolean;
  has_completed_synergy_quiz: boolean;
  avatar_url: string | null;
  user_type: "employer" | "candidate";
  skills?: string[] | null;
}

export interface CompletionItem {
  id: string;
  label: string;
  completed: boolean;
  path: string;
  comingSoon?: boolean;
  tier: "basic" | "extended";
}

export interface ProfileCompletionResult {
  percentage: number;
  basicPercentage: number;
  extendedPercentage: number;
  items: CompletionItem[];
  basicItems: CompletionItem[];
  extendedItems: CompletionItem[];
  message: string;
  isComplete: boolean;
}

export function useProfileCompletion(profile: Profile | null): ProfileCompletionResult {
  return useMemo(() => {
    if (!profile) {
      return {
        percentage: 0,
        basicPercentage: 0,
        extendedPercentage: 0,
        items: [],
        basicItems: [],
        extendedItems: [],
        message: "Let's get started!",
        isComplete: false,
      };
    }

    const isEmployer = profile.user_type === "employer";

    // Basic tier items (required for core functionality)
    const basicItems: CompletionItem[] = isEmployer
      ? [
          {
            id: "full-name",
            label: "Your Name",
            completed: !!profile.full_name,
            path: "/profile-setup",
            tier: "basic",
          },
          {
            id: "company-name",
            label: "Company Name",
            completed: !!profile.company_name,
            path: "/profile-setup",
            tier: "basic",
          },
          {
            id: "company-location",
            label: "Company Location",
            completed: !!profile.company_location,
            path: "/profile-setup",
            tier: "basic",
          },
        ]
      : [
          {
            id: "full-name",
            label: "Full Name",
            completed: !!profile.full_name,
            path: "/profile-setup",
            tier: "basic",
          },
          {
            id: "job-title",
            label: "Job Title",
            completed: !!profile.job_title,
            path: "/candidate-extended-profile",
            tier: "basic",
          },
          {
            id: "location",
            label: "Location",
            completed: !!profile.location,
            path: "/candidate-extended-profile",
            tier: "basic",
          },
        ];

    // Extended tier items (for profile completeness badge)
    const extendedItems: CompletionItem[] = isEmployer
      ? [
          {
            id: "logo",
            label: "Company Logo",
            completed: !!profile.avatar_url,
            path: "/profile-setup",
            tier: "extended",
          },
          {
            id: "bio",
            label: "Company Bio",
            completed: !!profile.bio,
            path: "/profile-setup",
            tier: "extended",
          },
          {
            id: "industry",
            label: "Industry",
            completed: !!profile.company_industry,
            path: "/profile-setup",
            tier: "extended",
          },
          {
            id: "culture-game",
            label: "Culture Game",
            completed: profile.has_completed_culture_game ?? false,
            path: "/employer-onboarding",
            tier: "extended",
          },
          {
            id: "synergy-score",
            label: "Synergy Score",
            completed: profile.has_completed_synergy_quiz ?? false,
            path: "/synergy-score-quiz",
            tier: "extended",
          },
          {
            id: "hiring-team",
            label: "Hiring Team",
            completed: profile.has_completed_manager_profile ?? false,
            path: "/manager-profile",
            comingSoon: true,
            tier: "extended",
          },
        ]
      : [
          {
            id: "avatar",
            label: "Profile Photo",
            completed: !!profile.avatar_url,
            path: "/profile-setup",
            tier: "extended",
          },
          {
            id: "bio",
            label: "Bio",
            completed: !!profile.bio,
            path: "/profile-setup",
            tier: "extended",
          },
          {
            id: "skills",
            label: "Skills",
            completed: (profile.skills?.length ?? 0) > 0,
            path: "/candidate-extended-profile",
            tier: "extended",
          },
          {
            id: "synergy-score",
            label: "Synergy Score",
            completed: profile.has_completed_synergy_quiz ?? false,
            path: "/synergy-score-quiz",
            tier: "extended",
          },
          {
            id: "culture-game",
            label: "Culture Game",
            completed: profile.has_completed_culture_game ?? false,
            path: "/candidate-onboarding",
            tier: "extended",
          },
        ];

    const allItems = [...basicItems, ...extendedItems];

    // Calculate percentages
    const basicCompletedCount = basicItems.filter((item) => item.completed).length;
    const extendedCompletedCount = extendedItems.filter(
      (item) => item.completed && !item.comingSoon
    ).length;
    const extendedTotalCount = extendedItems.filter((item) => !item.comingSoon).length;

    const basicPercentage = Math.round((basicCompletedCount / basicItems.length) * 100);
    const extendedPercentage = extendedTotalCount > 0
      ? Math.round((extendedCompletedCount / extendedTotalCount) * 100)
      : 0;

    // Total percentage (weighted: Basic 40%, Extended 60%)
    const percentage = Math.round(basicPercentage * 0.4 + extendedPercentage * 0.6);

    // Is complete if both basic and extended are 100%
    const isComplete = basicPercentage === 100 && extendedPercentage === 100;

    let message: string;
    if (percentage === 0) {
      message = "Let's get started!";
    } else if (percentage <= 25) {
      message = "You're off to a great start!";
    } else if (percentage <= 50) {
      message = "You're making progress!";
    } else if (percentage <= 75) {
      message = "Almost there!";
    } else if (percentage < 100) {
      message = "Just a few more steps!";
    } else {
      message = "Profile complete! 🎉";
    }

    return {
      percentage,
      basicPercentage,
      extendedPercentage,
      items: allItems,
      basicItems,
      extendedItems,
      message,
      isComplete,
    };
  }, [profile]);
}
