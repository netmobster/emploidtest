import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Interview {
  id: string;
  match_id: string | null;
  job_id: string | null;
  employer_id: string;
  candidate_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "rescheduled";
  notes: string | null;
  meeting_link: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useInterviews(matchId?: string) {
  const { user, profile } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterviews = useCallback(async () => {
    if (!user) {
      setInterviews([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from("interviews")
        .select("*")
        .order("scheduled_at", { ascending: true });

      if (matchId) {
        query = query.eq("match_id", matchId);
      } else {
        // Get all interviews for the current user
        query = query.or(`employer_id.eq.${user.id},candidate_id.eq.${user.id}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setInterviews((data as Interview[]) || []);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, matchId]);

  useEffect(() => {
    fetchInterviews();

    // Subscribe to realtime updates
    if (user) {
      const channel = supabase
        .channel(`interviews-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "interviews",
            filter: `employer_id=eq.${user.id}`,
          },
          () => fetchInterviews()
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "interviews",
            filter: `candidate_id=eq.${user.id}`,
          },
          () => fetchInterviews()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchInterviews]);

  const scheduleInterview = useCallback(
    async ({
      matchId,
      jobId,
      employerId,
      candidateId,
      scheduledAt,
      durationMinutes = 30,
      notes,
      meetingLink,
    }: {
      matchId: string;
      jobId?: string;
      employerId: string;
      candidateId: string;
      scheduledAt: Date;
      durationMinutes?: number;
      notes?: string;
      meetingLink?: string;
    }) => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from("interviews")
          .insert({
            match_id: matchId,
            job_id: jobId || null,
            employer_id: employerId,
            candidate_id: candidateId,
            scheduled_at: scheduledAt.toISOString(),
            duration_minutes: durationMinutes,
            notes: notes || null,
            meeting_link: meetingLink || null,
            created_by: user.id,
            status: user.id === employerId ? "confirmed" : "pending",
          })
          .select()
          .single();

        if (error) throw error;

        setInterviews((prev) => [...prev, data as Interview]);
        toast.success(
          user.id === employerId
            ? "Interview scheduled!"
            : "Interview request sent!"
        );
        return data as Interview;
      } catch (error) {
        console.error("Error scheduling interview:", error);
        toast.error("Failed to schedule interview");
        return null;
      }
    },
    [user]
  );

  const updateInterviewStatus = useCallback(
    async (interviewId: string, status: Interview["status"]) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("interviews")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", interviewId);

        if (error) throw error;

        setInterviews((prev) =>
          prev.map((i) =>
            i.id === interviewId ? { ...i, status, updated_at: new Date().toISOString() } : i
          )
        );

        const statusMessages: Record<Interview["status"], string> = {
          pending: "Interview marked as pending",
          confirmed: "Interview confirmed!",
          cancelled: "Interview cancelled",
          completed: "Interview marked as completed",
          rescheduled: "Interview marked for rescheduling",
        };

        toast.success(statusMessages[status]);
        return true;
      } catch (error) {
        console.error("Error updating interview:", error);
        toast.error("Failed to update interview");
        return false;
      }
    },
    [user]
  );

  const updateMeetingLink = useCallback(
    async (interviewId: string, meetingLink: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("interviews")
          .update({ meeting_link: meetingLink, updated_at: new Date().toISOString() })
          .eq("id", interviewId);

        if (error) throw error;

        setInterviews((prev) =>
          prev.map((i) =>
            i.id === interviewId
              ? { ...i, meeting_link: meetingLink, updated_at: new Date().toISOString() }
              : i
          )
        );

        toast.success("Meeting link updated");
        return true;
      } catch (error) {
        console.error("Error updating meeting link:", error);
        toast.error("Failed to update meeting link");
        return false;
      }
    },
    [user]
  );

  const upcomingInterviews = interviews.filter(
    (i) =>
      new Date(i.scheduled_at) > new Date() &&
      (i.status === "pending" || i.status === "confirmed")
  );

  const pastInterviews = interviews.filter(
    (i) => new Date(i.scheduled_at) <= new Date() || i.status === "completed"
  );

  return {
    interviews,
    upcomingInterviews,
    pastInterviews,
    isLoading,
    scheduleInterview,
    updateInterviewStatus,
    updateMeetingLink,
    refresh: fetchInterviews,
  };
}
