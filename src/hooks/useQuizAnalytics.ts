import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface QuizAnalyticsSummary {
  packId: string;
  packTitle: string;
  isCustomPack: boolean;
  totalSent: number;
  totalCompleted: number;
  completionRate: number;
  avgResponseTimeSeconds: number | null;
}

export interface QuizAnalyticsRecord {
  id: string;
  quiz_request_id: string;
  employer_id: string;
  candidate_id: string;
  pack_id: string;
  is_custom_pack: boolean;
  questions_sent: number;
  questions_answered: number;
  response_time_seconds: number | null;
  completed_at: string | null;
  created_at: string;
}

export const useQuizAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<QuizAnalyticsRecord[]>([]);
  const [summary, setSummary] = useState<QuizAnalyticsSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("quiz_analytics")
        .select("*")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnalytics(data || []);

      // Calculate summary by pack
      const packSummary = new Map<string, {
        packId: string;
        isCustomPack: boolean;
        totalSent: number;
        totalCompleted: number;
        totalResponseTime: number;
        completedWithTime: number;
      }>();

      data?.forEach((record) => {
        const existing = packSummary.get(record.pack_id) || {
          packId: record.pack_id,
          isCustomPack: record.is_custom_pack,
          totalSent: 0,
          totalCompleted: 0,
          totalResponseTime: 0,
          completedWithTime: 0,
        };

        existing.totalSent++;
        if (record.completed_at) {
          existing.totalCompleted++;
          if (record.response_time_seconds) {
            existing.totalResponseTime += record.response_time_seconds;
            existing.completedWithTime++;
          }
        }

        packSummary.set(record.pack_id, existing);
      });

      // Convert to array with calculated rates
      const summaryArray: QuizAnalyticsSummary[] = Array.from(packSummary.values()).map(
        (item) => ({
          packId: item.packId,
          packTitle: item.packId, // Will be enriched with actual titles later
          isCustomPack: item.isCustomPack,
          totalSent: item.totalSent,
          totalCompleted: item.totalCompleted,
          completionRate: item.totalSent > 0 ? (item.totalCompleted / item.totalSent) * 100 : 0,
          avgResponseTimeSeconds:
            item.completedWithTime > 0
              ? Math.round(item.totalResponseTime / item.completedWithTime)
              : null,
        })
      );

      setSummary(summaryArray.sort((a, b) => b.completionRate - a.completionRate));
    } catch (error) {
      console.error("Error fetching quiz analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const trackQuizSent = useCallback(
    async (
      quizRequestId: string,
      candidateId: string,
      packId: string,
      isCustomPack: boolean,
      questionCount: number
    ) => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from("quiz_analytics")
          .insert({
            quiz_request_id: quizRequestId,
            employer_id: user.id,
            candidate_id: candidateId,
            pack_id: packId,
            is_custom_pack: isCustomPack,
            questions_sent: questionCount,
          })
          .select()
          .single();

        if (error) throw error;
        await fetchAnalytics();
        return data;
      } catch (error) {
        console.error("Error tracking quiz sent:", error);
        return null;
      }
    },
    [user, fetchAnalytics]
  );

  const trackQuizCompleted = useCallback(
    async (quizRequestId: string, questionsAnswered: number) => {
      if (!user) return false;

      try {
        // Find the analytics record for this quiz
        const { data: existing, error: findError } = await supabase
          .from("quiz_analytics")
          .select("*")
          .eq("quiz_request_id", quizRequestId)
          .single();

        if (findError || !existing) {
          console.warn("No analytics record found for quiz:", quizRequestId);
          return false;
        }

        // Calculate response time
        const createdAt = new Date(existing.created_at).getTime();
        const completedAt = Date.now();
        const responseTimeSeconds = Math.round((completedAt - createdAt) / 1000);

        const { error } = await supabase
          .from("quiz_analytics")
          .update({
            questions_answered: questionsAnswered,
            response_time_seconds: responseTimeSeconds,
            completed_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
        await fetchAnalytics();
        return true;
      } catch (error) {
        console.error("Error tracking quiz completed:", error);
        return false;
      }
    },
    [user, fetchAnalytics]
  );

  return {
    analytics,
    summary,
    isLoading,
    trackQuizSent,
    trackQuizCompleted,
    refetch: fetchAnalytics,
  };
};
