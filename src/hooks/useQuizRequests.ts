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
      questions: { id: string; question: string; category: string }[]
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
    async (requestId: string) => {
      try {
        const { error } = await supabase
          .from("quiz_requests")
          .update({ status: "completed" })
          .eq("id", requestId);

        if (error) throw error;
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
