import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  city_id: string;
  role_id: string;
  created_at: string;
  type: string | null;
  matchCount: number;
  is_complete: boolean;
}

interface UseEmployerJobsReturn {
  jobs: Job[];
  isLoading: boolean;
  deleteJob: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useEmployerJobs(): UseEmployerJobsReturn {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch match counts for each job
      const jobsWithMatches = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { count } = await supabase
            .from("matches")
            .select("*", { count: "exact", head: true })
            .eq("job_id", job.id);

          return {
            ...job,
            matchCount: count ?? 0,
            is_complete: job.is_complete ?? false,
          };
        })
      );

      setJobs(jobsWithMatches);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const deleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setJobs((prev) => prev.filter((job) => job.id !== id));
      toast.success("Job deleted successfully");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    }
  };

  return { jobs, isLoading, deleteJob, refetch: fetchJobs };
}