import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ShortlistEntry {
  id: string;
  employer_id: string;
  job_id: string;
  candidate_id: string;
  notes: string | null;
  created_at: string;
}

export const useShortlist = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const addToShortlist = useCallback(
    async (jobId: string, candidateId: string, notes?: string) => {
      if (!user) return false;

      setIsLoading(true);
      try {
        // Check if already in shortlist
        const { data: existing } = await supabase
          .from("shortlists")
          .select("id")
          .eq("employer_id", user.id)
          .eq("job_id", jobId)
          .eq("candidate_id", candidateId)
          .single();

        if (existing) {
          toast.info("Already in shortlist for this role");
          return true;
        }

        const { error } = await supabase.from("shortlists").insert({
          employer_id: user.id,
          job_id: jobId,
          candidate_id: candidateId,
          notes: notes || null,
        });

        if (error) throw error;

        toast.success("Added to shortlist");
        return true;
      } catch (error) {
        console.error("Error adding to shortlist:", error);
        toast.error("Failed to add to shortlist");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const removeFromShortlist = useCallback(
    async (jobId: string, candidateId: string) => {
      if (!user) return false;

      setIsLoading(true);
      try {
        const { error } = await supabase
          .from("shortlists")
          .delete()
          .eq("employer_id", user.id)
          .eq("job_id", jobId)
          .eq("candidate_id", candidateId);

        if (error) throw error;

        toast.success("Removed from shortlist");
        return true;
      } catch (error) {
        console.error("Error removing from shortlist:", error);
        toast.error("Failed to remove from shortlist");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const isInShortlist = useCallback(
    async (jobId: string, candidateId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { data, error } = await supabase
          .from("shortlists")
          .select("id")
          .eq("employer_id", user.id)
          .eq("job_id", jobId)
          .eq("candidate_id", candidateId)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        return !!data;
      } catch (error) {
        console.error("Error checking shortlist:", error);
        return false;
      }
    },
    [user]
  );

  const getShortlistForJob = useCallback(
    async (jobId: string): Promise<ShortlistEntry[]> => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from("shortlists")
          .select("*")
          .eq("employer_id", user.id)
          .eq("job_id", jobId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching shortlist:", error);
        return [];
      }
    },
    [user]
  );

  return {
    addToShortlist,
    removeFromShortlist,
    isInShortlist,
    getShortlistForJob,
    isLoading,
  };
};
