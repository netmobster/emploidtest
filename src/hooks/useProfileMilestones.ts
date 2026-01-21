import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface MilestoneConfig {
  threshold: number;
  title: string;
  description: string;
  icon: string;
}

const MILESTONES: MilestoneConfig[] = [
  { threshold: 25, title: "25% Complete! 🎯", description: "Great start! Keep building your profile.", icon: "🎯" },
  { threshold: 50, title: "Halfway There! 🚀", description: "50% complete - you're making great progress!", icon: "🚀" },
  { threshold: 75, title: "Almost Done! 💪", description: "75% complete - just a few more steps!", icon: "💪" },
  { threshold: 100, title: "Profile Complete! 🎉", description: "You're all set to find your perfect match!", icon: "🎉" },
];

const STORAGE_KEY = "profile-milestones-shown";

export function useProfileMilestones(percentage: number) {
  const prevPercentage = useRef<number | null>(null);

  useEffect(() => {
    // Skip on first render or if percentage is 0
    if (prevPercentage.current === null || percentage === 0) {
      prevPercentage.current = percentage;
      return;
    }

    // Get shown milestones from localStorage
    const shownMilestones = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as number[];

    // Check each milestone
    for (const milestone of MILESTONES) {
      const wasBelowThreshold = prevPercentage.current < milestone.threshold;
      const isAtOrAboveThreshold = percentage >= milestone.threshold;
      const notYetShown = !shownMilestones.includes(milestone.threshold);

      if (wasBelowThreshold && isAtOrAboveThreshold && notYetShown) {
        // Show toast for this milestone
        toast.success(milestone.title, {
          description: milestone.description,
          duration: 5000,
        });

        // Mark as shown
        const updatedShown = [...shownMilestones, milestone.threshold];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedShown));
      }
    }

    prevPercentage.current = percentage;
  }, [percentage]);

  // Function to reset milestones (useful for testing or new users)
  const resetMilestones = () => {
    localStorage.removeItem(STORAGE_KEY);
    prevPercentage.current = 0;
  };

  return { resetMilestones };
}
