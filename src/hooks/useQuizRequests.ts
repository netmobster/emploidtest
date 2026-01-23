import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface QuizRequest {
  id: string;
  match_id: string;
  candidate_id: string;
  employer_id: string;
  employer_name: string;
  questions: { id: string; question: string; category: string }[];
  status: "pending" | "completed";
  created_at: string;
}

export const useQuizRequests = (matchId?: string) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<QuizRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!matchId || !user) return;

    try {
      const { data, error } = await supabase
        .from("quiz_requests")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests((data as QuizRequest[]) || []);
    } catch (error) {
      console.error("Error fetching quiz requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [matchId, user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const sendQuiz = useCallback(
    async (
      candidateId: string,
      employerName: string,
      questions: { id: string; question: string; category: string }[],
      packInfo?: { packId: string; isCustom: boolean }
    ) => {
      if (!user || !matchId) return null;

      try {
        const { data, error } = await supabase
          .from("quiz_requests")
          .insert({
            match_id: matchId,
            candidate_id: candidateId,
            employer_id: user.id,
            employer_name: employerName,
            questions,
            status: "pending",
          })
          .select()
          .single();

        if (error) throw error;

        // Track analytics if pack info is provided
        if (packInfo && data) {
          try {
            await supabase.from("quiz_analytics").insert({
              quiz_request_id: data.id,
              employer_id: user.id,
              candidate_id: candidateId,
              pack_id: packInfo.packId,
              is_custom_pack: packInfo.isCustom,
              questions_sent: questions.length,
            });
          } catch (analyticsError) {
            console.error("Error tracking quiz analytics:", analyticsError);
            // Don't fail the main operation for analytics
          }
        }
        
        await fetchRequests();
        toast.success("Quiz sent to candidate!");
        return data;
      } catch (error) {
        console.error("Error sending quiz:", error);
        toast.error("Failed to send quiz");
        return null;
      }
    },
    [user, matchId, fetchRequests]
  );

  const completeQuiz = useCallback(
    async (requestId: string, questionsAnswered?: number) => {
      try {
        const { error } = await supabase
          .from("quiz_requests")
          .update({ status: "completed" })
          .eq("id", requestId);

        if (error) throw error;

        // Update analytics with completion info
        if (questionsAnswered !== undefined) {
          try {
            // Find the analytics record
            const { data: analyticsRecord } = await supabase
              .from("quiz_analytics")
              .select("*")
              .eq("quiz_request_id", requestId)
              .single();

            if (analyticsRecord) {
              const createdAt = new Date(analyticsRecord.created_at).getTime();
              const responseTimeSeconds = Math.round((Date.now() - createdAt) / 1000);

              await supabase
                .from("quiz_analytics")
                .update({
                  questions_answered: questionsAnswered,
                  response_time_seconds: responseTimeSeconds,
                  completed_at: new Date().toISOString(),
                })
                .eq("id", analyticsRecord.id);
            }
          } catch (analyticsError) {
            console.error("Error updating quiz analytics:", analyticsError);
          }
        }

        await fetchRequests();
      } catch (error) {
        console.error("Error completing quiz:", error);
      }
    },
    [fetchRequests]
  );

  const pendingQuizzes = requests.filter(
    (r) => r.status === "pending" && r.candidate_id === user?.id
  );

  return {
    requests,
    pendingQuizzes,
    isLoading,
    sendQuiz,
    completeQuiz,
    refetch: fetchRequests,
  };
};
