import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Building2, ArrowRight, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { calculateSynergyCompatibility } from "@/lib/synergyUtils";

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location_text: string | null;
  work_mode: string | null;
  synergy_score: number;
  employer_id: string;
}

export function MatchesForYouSection() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!profile?.synergy_scores) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch active jobs with employer profiles that have synergy scores
        const { data: jobs, error } = await supabase
          .from("jobs")
          .select(`
            id,
            title,
            company,
            location_text,
            work_mode,
            user_id
          `)
          .eq("status", "active")
          .limit(10);

        if (error) throw error;

        if (!jobs || jobs.length === 0) {
          setMatches([]);
          setIsLoading(false);
          return;
        }

        // Fetch employer profiles for synergy calculation
        const employerIds = [...new Set(jobs.map((j) => j.user_id).filter(Boolean))];
        
        const { data: employerProfiles } = await supabase
          .from("profiles")
          .select("user_id, synergy_scores, culture_preferences")
          .in("user_id", employerIds);

        // Calculate synergy scores and sort
        const matchesWithScores: JobMatch[] = jobs
          .map((job) => {
            const employerProfile = employerProfiles?.find(
              (p) => p.user_id === job.user_id
            );
            
            const synergyScore = calculateSynergyCompatibility(
              profile.synergy_scores as Record<string, number> | null,
              employerProfile?.synergy_scores as Record<string, number> | null
            );

            return {
              id: job.id,
              title: job.title,
              company: job.company,
              location_text: job.location_text,
              work_mode: job.work_mode,
              synergy_score: synergyScore,
              employer_id: job.user_id || "",
            };
          })
          .filter((m) => m.synergy_score > 0)
          .sort((a, b) => b.synergy_score - a.synergy_score)
          .slice(0, 5);

        setMatches(matchesWithScores);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [profile]);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Matches for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Matches for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              No synergy matches found yet. Check back soon!
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/city?type=candidate")}
            >
              Browse Jobs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Matches for You
          <Badge variant="secondary" className="ml-auto">
            Based on Synergy
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {matches.map((match, idx) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/swipe/candidate?job=${match.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-semibold text-foreground truncate">
                      {match.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">{match.company}</span>
                  </div>
                  {match.location_text && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{match.location_text}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant="default"
                    className="bg-gradient-to-r from-primary to-accent text-white"
                  >
                    {match.synergy_score}% Match
                  </Badge>
                  {match.work_mode && (
                    <Badge variant="outline" className="text-xs">
                      {match.work_mode}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => navigate("/city?type=candidate")}
        >
          See All Matches
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
