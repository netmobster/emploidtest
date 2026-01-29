import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Users, 
  Loader2, 
  Search,
  Zap,
  CheckCircle,
  ArrowRight,
  Briefcase,
  User,
  Building2,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { TEST_EMPLOYER_ID, TEST_CANDIDATE_ID } from "@/lib/gameData";
import { useNavigate } from "react-router-dom";

interface Profile {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  user_type: string;
  email: string | null;
  job_title: string | null;
}

interface Job {
  id: string;
  title: string;
  company: string;
  user_id: string | null;
}

export function ForceMatchPanel() {
  const navigate = useNavigate();
  const [employers, setEmployers] = useState<Profile[]>([]);
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  
  const [selectedEmployer, setSelectedEmployer] = useState<Profile | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Profile | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  
  const [employerSearch, setEmployerSearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  
  const [successDialog, setSuccessDialog] = useState<{
    open: boolean;
    matchId: string;
    candidate: string;
    employer: string;
    alreadyExisted: boolean;
  }>({ open: false, matchId: "", candidate: "", employer: "", alreadyExisted: false });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name, avatar_url, user_type, email, job_title")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const employerList = (profilesData || []).filter(p => p.user_type === "employer");
      const candidateList = (profilesData || []).filter(p => p.user_type === "candidate");

      setEmployers(employerList);
      setCandidates(candidateList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch jobs for selected employer
  const fetchJobs = useCallback(async (employerId: string) => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, company, user_id")
        .eq("user_id", employerId)
        .eq("is_complete", true);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedEmployer) {
      fetchJobs(selectedEmployer.user_id);
      setSelectedJobId("");
    } else {
      setJobs([]);
      setSelectedJobId("");
    }
  }, [selectedEmployer, fetchJobs]);

  // Filter users based on search
  const filteredEmployers = employers.filter(e => {
    const searchLower = employerSearch.toLowerCase();
    return (
      e.full_name?.toLowerCase().includes(searchLower) ||
      e.company_name?.toLowerCase().includes(searchLower) ||
      e.email?.toLowerCase().includes(searchLower)
    );
  });

  const filteredCandidates = candidates.filter(c => {
    const searchLower = candidateSearch.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(searchLower) ||
      c.job_title?.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower)
    );
  });

  // Force match
  const handleForceMatch = async () => {
    if (!selectedEmployer || !selectedCandidate) {
      toast.error("Please select both an employer and a candidate");
      return;
    }

    setIsMatching(true);
    try {
      const { data, error } = await supabase.functions.invoke("force-match", {
        body: {
          candidateId: selectedCandidate.user_id,
          employerId: selectedEmployer.user_id,
          jobId: selectedJobId || null,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setSuccessDialog({
        open: true,
        matchId: data.matchId,
        candidate: data.candidate || selectedCandidate.full_name || "Candidate",
        employer: data.employer || selectedEmployer.company_name || selectedEmployer.full_name || "Employer",
        alreadyExisted: data.alreadyExisted,
      });
    } catch (error) {
      console.error("Error force-matching:", error);
      toast.error("Failed to create match");
    } finally {
      setIsMatching(false);
    }
  };

  const isTestUser = (userId: string) => {
    return userId === TEST_EMPLOYER_ID || userId === TEST_CANDIDATE_ID;
  };

  const UserCard = ({ 
    user, 
    isSelected, 
    onSelect, 
    type 
  }: { 
    user: Profile; 
    isSelected: boolean; 
    onSelect: () => void;
    type: "employer" | "candidate";
  }) => (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? "border-primary bg-primary/10 ring-2 ring-primary" 
          : "hover:border-primary/50"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback>
            {type === "employer" ? (
              <Building2 className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">
              {type === "employer" 
                ? user.company_name || user.full_name || "Unknown" 
                : user.full_name || "Unknown"}
            </p>
            {isTestUser(user.user_id) && (
              <Badge variant="secondary" className="text-xs">Test</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {type === "employer" 
              ? user.full_name || user.email 
              : user.job_title || user.email}
          </p>
        </div>
        {isSelected && (
          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Force Match</h2>
          <p className="text-muted-foreground">
            Create matches between any users for testing purposes
          </p>
        </div>
        <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employer Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Select Employer
              </CardTitle>
              <CardDescription>
                {employers.length} employers available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employers..."
                  value={employerSearch}
                  onChange={(e) => setEmployerSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {filteredEmployers.map((employer) => (
                    <UserCard
                      key={employer.user_id}
                      user={employer}
                      isSelected={selectedEmployer?.user_id === employer.user_id}
                      onSelect={() => setSelectedEmployer(employer)}
                      type="employer"
                    />
                  ))}
                  {filteredEmployers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No employers found
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Candidate Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Candidate
              </CardTitle>
              <CardDescription>
                {candidates.length} candidates available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {filteredCandidates.map((candidate) => (
                    <UserCard
                      key={candidate.user_id}
                      user={candidate}
                      isSelected={selectedCandidate?.user_id === candidate.user_id}
                      onSelect={() => setSelectedCandidate(candidate)}
                      type="candidate"
                    />
                  ))}
                  {filteredCandidates.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No candidates found
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Match Action */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Create Match
              </CardTitle>
              <CardDescription>
                Review and confirm the match
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Users Preview */}
              <div className="space-y-3">
                <div className="p-3 border rounded-lg bg-muted/30">
                  <Label className="text-xs text-muted-foreground">Employer</Label>
                  {selectedEmployer ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedEmployer.avatar_url || undefined} />
                        <AvatarFallback><Building2 className="h-3 w-3" /></AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {selectedEmployer.company_name || selectedEmployer.full_name}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">Not selected</p>
                  )}
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="p-3 border rounded-lg bg-muted/30">
                  <Label className="text-xs text-muted-foreground">Candidate</Label>
                  {selectedCandidate ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedCandidate.avatar_url || undefined} />
                        <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {selectedCandidate.full_name}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">Not selected</p>
                  )}
                </div>
              </div>

              {/* Job Selection (optional) */}
              {selectedEmployer && jobs.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Link to Job (Optional)
                  </Label>
                  <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No job</SelectItem>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Match Button */}
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleForceMatch}
                disabled={!selectedEmployer || !selectedCandidate || isMatching}
              >
                {isMatching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Force Match
              </Button>

              {/* Quick Test Match Buttons */}
              <div className="border-t pt-4 space-y-2">
                <Label className="text-xs text-muted-foreground">Quick Actions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const testEmployer = employers.find(e => e.user_id === TEST_EMPLOYER_ID);
                      if (testEmployer) setSelectedEmployer(testEmployer);
                    }}
                  >
                    Select Test Employer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const testCandidate = candidates.find(c => c.user_id === TEST_CANDIDATE_ID);
                      if (testCandidate) setSelectedCandidate(testCandidate);
                    }}
                  >
                    Select Test Candidate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Dialog */}
      <Dialog open={successDialog.open} onOpenChange={(open) => setSuccessDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              {successDialog.alreadyExisted ? "Match Already Exists" : "Match Created!"}
            </DialogTitle>
            <DialogDescription>
              {successDialog.alreadyExisted
                ? `A match between ${successDialog.employer} and ${successDialog.candidate} already exists.`
                : `Successfully matched ${successDialog.employer} with ${successDialog.candidate}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setSuccessDialog(prev => ({ ...prev, open: false }))}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                navigate(`/chat/${successDialog.matchId}`);
                setSuccessDialog(prev => ({ ...prev, open: false }));
              }}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Open Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
