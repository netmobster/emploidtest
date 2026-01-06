import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Job {
  id: string;
  title: string;
  company: string;
  city_id: string;
  role_id: string;
  salary: string | null;
  type: string | null;
  remote: boolean | null;
  description: string | null;
  requirements: string[] | null;
  benefits: string[] | null;
  user_id: string | null;
}

export function useJobRecommendations() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchJobs = async () => {
      try {
        // Get jobs the user has already swiped on
        const { data: swipedJobs } = await supabase
          .from("swipes")
          .select("job_id")
          .eq("swiper_id", user.id);

        const swipedJobIds = swipedJobs?.map((s) => s.job_id).filter(Boolean) || [];

        // Fetch jobs not yet swiped
        let query = supabase
          .from("jobs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (swipedJobIds.length > 0) {
          query = query.not("id", "in", `(${swipedJobIds.join(",")})`);
        }

        const { data, error } = await query;

        if (error) throw error;
        setJobs(data || []);
      } catch (error) {
        console.error("Error fetching job recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  return { jobs, isLoading };
}
