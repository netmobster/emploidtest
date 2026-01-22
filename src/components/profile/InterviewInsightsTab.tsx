import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Calendar, User, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  employer?: {
    full_name: string;
    company_name: string;
  };
}

interface InterviewInsightsTabProps {
  candidateId: string;
}

export function InterviewInsightsTab({ candidateId }: InterviewInsightsTabProps) {
  const [insights, setInsights] = useState<InterviewInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data, error } = await supabase
          .from("interview_insights")
          .select("*")
          .eq("candidate_id", candidateId)
          .order("completed_at", { ascending: false });

        if (error) throw error;

        // Fetch employer info for each insight
        const insightsWithEmployers = await Promise.all(
          (data || []).map(async (insight) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, company_name")
              .eq("user_id", insight.employer_id)
              .single();

            return {
              ...insight,
              employer: profile,
            } as unknown as InterviewInsight;
          })
        );

        setInsights(insightsWithEmployers);
      } catch (error) {
        console.error("Error fetching interview insights:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (candidateId) {
      fetchInsights();
    }
  }, [candidateId]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">No Insights Yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Interview insights from "Get to Know" quizzes will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {insights.map((insight) => {
        const isExpanded = expandedId === insight.id;
        const responses = insight.responses as InsightResponse[];

        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border rounded-xl overflow-hidden bg-card"
          >
            {/* Header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : insight.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-sm">Candidate Deep-Dive</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>
                      {insight.employer?.company_name || insight.employer?.full_name || "Employer"}
                    </span>
                    <span>•</span>
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(insight.completed_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {responses.length} responses
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border"
              >
                <div className="p-4 space-y-4">
                  {responses.map((response, idx) => (
                    <div key={response.questionId} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-primary">
                            Q{idx + 1}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {response.question}
                        </p>
                      </div>
                      <div className="ml-7 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-foreground">{response.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
