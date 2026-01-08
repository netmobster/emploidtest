import { useMemo } from "react";

interface Profile {
  has_completed_profile: boolean;
  has_completed_culture_game: boolean;
  has_completed_extended_profile: boolean;
  has_completed_work_love_language: boolean;
  has_completed_manager_profile: boolean;
  avatar_url: string | null;
  user_type: "employer" | "candidate";
}

export interface CompletionItem {
  id: string;
  label: string;
  completed: boolean;
  path: string;
  comingSoon?: boolean;
}

export interface ProfileCompletionResult {
  percentage: number;
  items: CompletionItem[];
  message: string;
}

export function useProfileCompletion(profile: Profile | null): ProfileCompletionResult {
  return useMemo(() => {
    if (!profile) {
      return {
        percentage: 0,
        items: [],
        message: "Let's get started!",
      };
    }

    const isEmployer = profile.user_type === "employer";

    const items: CompletionItem[] = [
      {
        id: "basic-profile",
        label: "Basic Profile",
        completed: profile.has_completed_profile ?? false,
        path: "/profile-setup",
      },
      {
        id: "culture-game",
        label: "Culture Game",
        completed: profile.has_completed_culture_game ?? false,
        path: isEmployer ? "/employer-onboarding" : "/candidate-onboarding",
      },
      {
        id: "extended-profile",
        label: "Extended Profile",
        completed: profile.has_completed_extended_profile ?? false,
        path: isEmployer ? "/profile-setup" : "/candidate-extended-profile",
      },
      {
        id: "avatar",
        label: isEmployer ? "Company Logo" : "Profile Photo",
        completed: !!profile.avatar_url,
        path: "/profile-setup",
      },
      {
        id: "work-love-language",
        label: "Work Love Language",
        completed: profile.has_completed_work_love_language ?? false,
        path: "/work-love-language",
        comingSoon: true,
      },
    ];

    // Add manager profile for employers only
    if (isEmployer) {
      items.push({
        id: "manager-profile",
        label: "Manager Profile",
        completed: profile.has_completed_manager_profile ?? false,
        path: "/manager-profile",
        comingSoon: true,
      });
    }

    const completedCount = items.filter((item) => item.completed).length;
    const percentage = Math.round((completedCount / items.length) * 100);

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

    return { percentage, items, message };
  }, [profile]);
}
