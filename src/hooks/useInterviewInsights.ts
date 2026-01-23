import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface InsightResponse {
  questionId: string;
  question: string;
  answer: string;
}

interface InterviewInsight {
  id: string;
  match_id: string;
  candidate_id: string;
  employer_id: string;
  questions: { id: string; question: string; category: string }[];
  responses: InsightResponse[];
  completed_at: string;
  created_at: string;
}

export const useInterviewInsights = (matchId?: string, candidateId?: string) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<InterviewInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    if (!user) return;

    try {
      let query = supabase.from("interview_insights").select("*");

      if (matchId) {
        query = query.eq("match_id", matchId);
      } else if (candidateId) {
        query = query.eq("candidate_id", candidateId);
      } else {
        return;
      }

      const { data, error } = await query.order("completed_at", { ascending: false });

      if (error) throw error;
      setInsights((data as unknown as InterviewInsight[]) || []);
    } catch (error) {
      console.error("Error fetching interview insights:", error);
    } finally {
      setIsLoading(false);
    }
  }, [matchId, candidateId, user]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const saveInsights = useCallback(
    async (
      matchId: string,
      candidateId: string,
      employerId: string,
      questions: { id: string; question: string; category: string }[],
      responses: InsightResponse[],
      candidateName?: string
    ) => {
      if (!user) return null;

      try {
        const insertData = {
          match_id: matchId,
          candidate_id: candidateId,
          employer_id: employerId,
          questions: questions as unknown as Record<string, unknown>[],
          responses: responses as unknown as Record<string, unknown>[],
        };
        
        const { data, error } = await supabase
          .from("interview_insights")
          .insert(insertData as any)
          .select()
          .single();

        if (error) throw error;
        
        // Send email notification to employer
        try {
          await supabase.functions.invoke("send-notification-email", {
            body: {
              type: "quiz_completed",
              userId: employerId,
              data: {
                matchId,
                candidateName: candidateName || "A candidate",
                responseCount: responses.length,
              },
            },
          });
        } catch (emailError) {
          console.error("Error sending quiz completion email:", emailError);
        }
        
        await fetchInsights();
        return data;
      } catch (error) {
        console.error("Error saving interview insights:", error);
        toast.error("Failed to save insights");
        return null;
      }
    },
    [user, fetchInsights]
  );

  return {
    insights,
    isLoading,
    saveInsights,
    refetch: fetchInsights,
  };
};
