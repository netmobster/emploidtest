import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ApplicationStatus = "saved" | "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";

interface CreateApplicationParams {
  jobId: string;
  matchId?: string;
  status?: ApplicationStatus;
}

export function useJobApplication() {
  const { user } = useAuth();

  const createApplication = useCallback(
    async ({ jobId, matchId, status = "saved" }: CreateApplicationParams) => {
      if (!user) return null;

      try {
        // Check if application already exists
        const { data: existing } = await supabase
          .from("job_applications")
          .select("id")
          .eq("user_id", user.id)
          .eq("job_id", jobId)
          .maybeSingle();

        if (existing) {
          // Update existing application if match_id is provided
          if (matchId) {
            await supabase
              .from("job_applications")
              .update({ match_id: matchId, status: "applied" })
              .eq("id", existing.id);
          }
          return existing;
        }

        // Create new application
        const { data, error } = await supabase
          .from("job_applications")
          .insert({
            user_id: user.id,
            job_id: jobId,
            match_id: matchId || null,
            status,
            applied_at: status === "applied" ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) {
          // Ignore unique constraint violations (already exists)
          if (error.code !== "23505") {
            throw error;
          }
          return null;
        }

        return data;
      } catch (error) {
        console.error("Error creating job application:", error);
        return null;
      }
    },
    [user]
  );

  const updateApplicationStatus = useCallback(
    async (applicationId: string, status: ApplicationStatus, notes?: string) => {
      if (!user) return false;

      try {
        const updateData: Record<string, string | null> = {
          status,
          updated_at: new Date().toISOString(),
        };

        if (status === "applied") {
          updateData.applied_at = new Date().toISOString();
        }

        if (notes !== undefined) {
          updateData.notes = notes;
        }

        const { error } = await supabase
          .from("job_applications")
          .update(updateData)
          .eq("id", applicationId)
          .eq("user_id", user.id);

        if (error) throw error;

        toast.success(`Application status updated to ${status}`);
        return true;
      } catch (error) {
        console.error("Error updating application:", error);
        toast.error("Failed to update application");
        return false;
      }
    },
    [user]
  );

  return {
    createApplication,
    updateApplicationStatus,
  };
}
