import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Briefcase,
  Loader2,
  ChevronDown,
  Users,
  BarChart3,
  MessageSquare,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateSynergyCompatibility, getCompatibilityLabel, getCompatibilityColor } from "@/lib/synergyUtils";
import { calculateCultureCompatibility } from "@/lib/cultureUtils";
import { cn } from "@/lib/utils";
import { SynergyComparisonChart } from "@/components/shortlist/SynergyComparisonChart";
import { CandidateComparisonCard } from "@/components/shortlist/CandidateComparisonCard";

interface Job {
  id: string;
  title: string;
  company: string;
}

interface ShortlistCandidate {
  id: string;
  candidate_id: string;
  notes: string | null;
  created_at: string;
  profile: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    job_title: string | null;
    location: string | null;
    skills: string[] | null;
    years_of_experience: string | null;
    synergy_scores: Record<string, number> | null;
    culture_preferences: Record<string, string> | null;
    bio: string | null;
  } | null;
}

const Shortlists = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<ShortlistCandidate[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  // Fetch jobs
  useEffect(() => {
    if (!user) return;

    const fetchJobs = async () => {
      setIsLoadingJobs(true);
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("id, title, company")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setJobs(data || []);

        // Set initial job from URL or first job
        const jobIdFromUrl = searchParams.get("job");
        if (jobIdFromUrl && data?.some((j) => j.id === jobIdFromUrl)) {
          setSelectedJobId(jobIdFromUrl);
        } else if (data && data.length > 0) {
          setSelectedJobId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [user, searchParams]);

  // Fetch candidates for selected job
  useEffect(() => {
    if (!user || !selectedJobId) return;

    const fetchCandidates = async () => {
      setIsLoadingCandidates(true);
      try {
        // Fetch shortlists for job
        const { data: shortlists, error: shortlistError } = await supabase
          .from("shortlists")
          .select("*")
          .eq("employer_id", user.id)
          .eq("job_id", selectedJobId);

        if (shortlistError) throw shortlistError;

        if (!shortlists || shortlists.length === 0) {
          setCandidates([]);
          setSelectedCandidates(new Set());
          return;
        }

        // Fetch profiles for candidates
        const candidateIds = shortlists.map((s) => s.candidate_id);
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select(
            "user_id, full_name, avatar_url, job_title, location, skills, years_of_experience, synergy_scores, culture_preferences, bio"
          )
          .in("user_id", candidateIds);

        if (profilesError) throw profilesError;

        // Combine data
        const enriched = shortlists.map((shortlist) => ({
          ...shortlist,
          profile: profiles?.find((p) => p.user_id === shortlist.candidate_id) as ShortlistCandidate["profile"] || null,
        }));

        setCandidates(enriched);

        // Auto-select first 2-3 for comparison
        const autoSelect = enriched.slice(0, Math.min(3, enriched.length)).map((c) => c.candidate_id);
        setSelectedCandidates(new Set(autoSelect));
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setIsLoadingCandidates(false);
      }
    };

    fetchCandidates();
  }, [user, selectedJobId]);

  // Handle job change
  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    setSearchParams({ job: jobId });
  };

  // Toggle candidate selection
  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidates((prev) => {
      const next = new Set(prev);
      if (next.has(candidateId)) {
        next.delete(candidateId);
      } else {
        if (next.size < 4) {
          // Max 4 for comparison
          next.add(candidateId);
        }
      }
      return next;
    });
  };

  // Calculate scores for selected candidates
  const comparisonData = useMemo(() => {
    const selected = candidates.filter((c) => selectedCandidates.has(c.candidate_id));
    const employerSynergy = profile?.synergy_scores as Record<string, number> | null;
    const employerCulture = profile?.culture_preferences as Record<string, string> | null;

    return selected.map((candidate) => {
      const synergyScore = calculateSynergyCompatibility(
        candidate.profile?.synergy_scores,
        employerSynergy
      );

      const cultureResult = calculateCultureCompatibility(
        candidate.profile?.culture_preferences,
        employerCulture
      );

      return {
        ...candidate,
        synergyScore,
        cultureScore: cultureResult.score,
        overallScore: Math.round((synergyScore + cultureResult.score) / 2),
      };
    });
  }, [candidates, selectedCandidates, profile]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  if (isLoadingJobs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Shortlist Comparison
              </h1>
              <p className="text-xs text-muted-foreground">
                Compare candidates side-by-side
              </p>
            </div>
          </div>

          {/* Job Selector */}
          <Select value={selectedJobId} onValueChange={handleJobChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {job.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.header>

      <div className="p-4 space-y-6">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-foreground">No roles yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create a job posting to start building shortlists
              </p>
              <Button onClick={() => navigate("/employer-dashboard")}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : candidates.length === 0 && !isLoadingCandidates ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-foreground">
                No candidates shortlisted
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Shortlist candidates from your matches to compare them here
              </p>
              <Button onClick={() => navigate("/matches")}>
                View Matches
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Candidate Selection */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Select Candidates to Compare
                  </span>
                  <Badge variant="secondary">
                    {selectedCandidates.size} / 4 selected
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-3 pb-2">
                    {isLoadingCandidates ? (
                      <div className="flex items-center justify-center w-full py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      candidates.map((candidate) => {
                        const isSelected = selectedCandidates.has(candidate.candidate_id);
                        return (
                          <button
                            key={candidate.candidate_id}
                            onClick={() => toggleCandidate(candidate.candidate_id)}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-all",
                              "min-w-[200px]",
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="relative">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={candidate.profile?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {candidate.profile?.full_name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-sm truncate max-w-[120px]">
                                {candidate.profile?.full_name || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {candidate.profile?.job_title || "No title"}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Comparison View */}
            {comparisonData.length >= 2 && (
              <>
                {/* Synergy Comparison Chart */}
                <SynergyComparisonChart
                  candidates={comparisonData}
                  employerScores={profile?.synergy_scores as Record<string, number> | null}
                />

                {/* Side-by-Side Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <AnimatePresence mode="popLayout">
                    {comparisonData.map((candidate, index) => (
                      <motion.div
                        key={candidate.candidate_id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CandidateComparisonCard
                          candidate={candidate}
                          onRemove={() => toggleCandidate(candidate.candidate_id)}
                          onViewProfile={() => navigate(`/candidate/${candidate.candidate_id}`)}
                          onMessage={() => {
                            // Find match and navigate to chat
                            // For now, navigate to matches
                            navigate("/matches");
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}

            {comparisonData.length < 2 && selectedCandidates.size < 2 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">
                    Select at least 2 candidates to compare
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shortlists;
