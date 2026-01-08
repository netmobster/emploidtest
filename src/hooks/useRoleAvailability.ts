import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RoleAvailability {
  [roleId: string]: {
    hasJobs: boolean;
    hasCandidates: boolean;
    jobCount: number;
    candidateCount: number;
  };
}

export const useRoleAvailability = (cityId: string) => {
  const [availability, setAvailability] = useState<RoleAvailability>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        // Fetch job counts by role
        const { data: jobs } = await supabase
          .from("jobs")
          .select("role_id")
          .eq("city_id", cityId);

        // Fetch candidate counts by checking profiles with completed games
        const { data: candidates } = await supabase
          .from("profiles")
          .select("id, location, has_completed_culture_game")
          .eq("user_type", "candidate")
          .eq("has_completed_culture_game", true);

        // Count jobs per role
        const jobCounts: Record<string, number> = {};
        (jobs || []).forEach((job) => {
          jobCounts[job.role_id] = (jobCounts[job.role_id] || 0) + 1;
        });

        // For now, we'll consider candidates available for all roles if they've completed the game
        const candidateCount = candidates?.length || 0;

        // Build availability map
        const availabilityMap: RoleAvailability = {};
        const roleIds = new Set([
          ...(jobs || []).map((j) => j.role_id),
          "product-manager",
          "software-engineer",
          "ux-designer",
          "data-scientist",
          "marketing-manager",
          "sales-representative",
        ]);

        roleIds.forEach((roleId) => {
          availabilityMap[roleId] = {
            hasJobs: (jobCounts[roleId] || 0) > 0,
            hasCandidates: candidateCount > 0,
            jobCount: jobCounts[roleId] || 0,
            candidateCount: candidateCount,
          };
        });

        setAvailability(availabilityMap);
      } catch (error) {
        console.error("Error fetching role availability:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (cityId) {
      fetchAvailability();
    }
  }, [cityId]);

  return { availability, isLoading };
};
