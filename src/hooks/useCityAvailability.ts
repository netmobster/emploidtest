import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CityAvailability {
  [cityId: string]: {
    hasJobs: boolean;
    hasCandidates: boolean;
    jobCount: number;
    candidateCount: number;
  };
}

export const useCityAvailability = () => {
  const [availability, setAvailability] = useState<CityAvailability>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        // Fetch job counts by city
        const { data: jobs } = await supabase
          .from("jobs")
          .select("city_id");

        // Fetch candidate counts by checking profiles with completed games
        const { data: candidates } = await supabase
          .from("profiles")
          .select("id, location, has_completed_culture_game")
          .eq("user_type", "candidate")
          .eq("has_completed_culture_game", true);

        // Count jobs per city
        const jobCounts: Record<string, number> = {};
        (jobs || []).forEach((job) => {
          jobCounts[job.city_id] = (jobCounts[job.city_id] || 0) + 1;
        });

        // Count candidates per city (approximate based on location)
        const candidateCounts: Record<string, number> = {};
        const candidateCount = candidates?.length || 0;

        // Default cities
        const cityIds = ["toronto", "new-york", "san-francisco", "london"];

        // Build availability map
        const availabilityMap: CityAvailability = {};
        cityIds.forEach((cityId) => {
          const cityJobCount = jobCounts[cityId] || 0;
          availabilityMap[cityId] = {
            hasJobs: cityJobCount > 0,
            hasCandidates: candidateCount > 0,
            jobCount: cityJobCount,
            candidateCount: candidateCount,
          };
        });

        setAvailability(availabilityMap);
      } catch (error) {
        console.error("Error fetching city availability:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  return { availability, isLoading };
};
