import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Briefcase,
  Users,
  Edit2,
  Save,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  FlaskConical,
  MapPin,
  DollarSign,
  Target,
  Sparkles,
  Search,
  Plus,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { TEST_EMPLOYER_ID, CITIES, ROLES } from "@/lib/gameData";

interface TestJob {
  id: string;
  title: string;
  company: string;
  description: string | null;
  city_id: string;
  role_id: string;
  salary: string | null;
  work_mode: string | null;
  location_text: string | null;
  mission_statement: string | null;
  big_rocks: any;
  daily_stack: string[] | null;
  requirements: string[] | null;
  is_complete: boolean | null;
  status: string | null;
  pay_min: number | null;
  pay_max: number | null;
  created_at: string;
}

interface TestCandidate {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  job_title: string | null;
  location: string | null;
  bio: string | null;
  skills: string[] | null;
  culture_preferences: any;
  synergy_scores: any;
  has_completed_profile: boolean | null;
  has_completed_synergy_quiz: boolean | null;
  has_completed_culture_game: boolean | null;
  avatar_url: string | null;
  work_mode: string | null;
  city_hub: string | null;
  created_at: string;
}

export function TestDataEditorPanel() {
  const [jobs, setJobs] = useState<TestJob[]>([]);
  const [candidates, setCandidates] = useState<TestCandidate[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [editingJob, setEditingJob] = useState<TestJob | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<TestCandidate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Search and filter state
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateFilter, setCandidateFilter] = useState<"all" | "complete" | "incomplete">("all");
  
  // Create job state
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    title: "",
    company: "Emploid Test",
    city_id: "nyc",
    role_id: "growth",
    work_mode: "remote",
    description: "",
    salary: "",
    pay_min: "",
    pay_max: "",
    location_text: "",
    mission_statement: "",
    requirements: "",
  });

  // Form state for job editing
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    description: "",
    salary: "",
    work_mode: "remote",
    location_text: "",
    mission_statement: "",
    big_rocks: "",
    daily_stack: "",
    requirements: "",
    is_complete: false,
    pay_min: "",
    pay_max: "",
  });

  // Form state for candidate editing
  const [candidateForm, setCandidateForm] = useState({
    full_name: "",
    email: "",
    job_title: "",
    location: "",
    bio: "",
    skills: "",
    work_mode: "remote",
    city_hub: "",
    has_completed_profile: false,
    has_completed_synergy_quiz: false,
    has_completed_culture_game: false,
    synergy_scores: "",
    culture_preferences: "",
  });

  const fetchJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("user_id", TEST_EMPLOYER_ID)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error("Failed to fetch test jobs:", err);
      toast.error("Failed to load test jobs");
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const fetchCandidates = async () => {
    setIsLoadingCandidates(true);
    try {
      // Fetch candidates (non-employer profiles)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_type", "candidate")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
      toast.error("Failed to load candidates");
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, []);

  const openJobEditor = (job: TestJob) => {
    setEditingJob(job);
    setJobForm({
      title: job.title || "",
      company: job.company || "",
      description: job.description || "",
      salary: job.salary || "",
      work_mode: job.work_mode || "remote",
      location_text: job.location_text || "",
      mission_statement: job.mission_statement || "",
      big_rocks: JSON.stringify(job.big_rocks || [], null, 2),
      daily_stack: (job.daily_stack || []).join("\n"),
      requirements: (job.requirements || []).join("\n"),
      is_complete: job.is_complete || false,
      pay_min: job.pay_min?.toString() || "",
      pay_max: job.pay_max?.toString() || "",
    });
  };

  const openCandidateEditor = (candidate: TestCandidate) => {
    setEditingCandidate(candidate);
    setCandidateForm({
      full_name: candidate.full_name || "",
      email: candidate.email || "",
      job_title: candidate.job_title || "",
      location: candidate.location || "",
      bio: candidate.bio || "",
      skills: (candidate.skills || []).join(", "),
      work_mode: candidate.work_mode || "remote",
      city_hub: candidate.city_hub || "",
      has_completed_profile: candidate.has_completed_profile || false,
      has_completed_synergy_quiz: candidate.has_completed_synergy_quiz || false,
      has_completed_culture_game: candidate.has_completed_culture_game || false,
      synergy_scores: JSON.stringify(candidate.synergy_scores || {}, null, 2),
      culture_preferences: JSON.stringify(candidate.culture_preferences || {}, null, 2),
    });
  };

  const saveJob = async () => {
    if (!editingJob) return;
    setIsSaving(true);

    try {
      let parsedBigRocks = [];
      try {
        parsedBigRocks = JSON.parse(jobForm.big_rocks);
      } catch {
        parsedBigRocks = [];
      }

      const { error } = await supabase
        .from("jobs")
        .update({
          title: jobForm.title,
          company: jobForm.company,
          description: jobForm.description || null,
          salary: jobForm.salary || null,
          work_mode: jobForm.work_mode,
          location_text: jobForm.location_text || null,
          mission_statement: jobForm.mission_statement || null,
          big_rocks: parsedBigRocks,
          daily_stack: jobForm.daily_stack.split("\n").filter(Boolean),
          requirements: jobForm.requirements.split("\n").filter(Boolean),
          is_complete: jobForm.is_complete,
          pay_min: jobForm.pay_min ? parseInt(jobForm.pay_min) : null,
          pay_max: jobForm.pay_max ? parseInt(jobForm.pay_max) : null,
        })
        .eq("id", editingJob.id);

      if (error) throw error;

      toast.success("Job updated successfully");
      setEditingJob(null);
      fetchJobs();
    } catch (err) {
      console.error("Failed to save job:", err);
      toast.error("Failed to save job");
    } finally {
      setIsSaving(false);
    }
  };

  const saveCandidate = async () => {
    if (!editingCandidate) return;
    setIsSaving(true);

    try {
      let parsedSynergyScores = {};
      let parsedCulturePreferences = {};
      try {
        parsedSynergyScores = JSON.parse(candidateForm.synergy_scores);
      } catch {
        parsedSynergyScores = {};
      }
      try {
        parsedCulturePreferences = JSON.parse(candidateForm.culture_preferences);
      } catch {
        parsedCulturePreferences = {};
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: candidateForm.full_name || null,
          email: candidateForm.email || null,
          job_title: candidateForm.job_title || null,
          location: candidateForm.location || null,
          bio: candidateForm.bio || null,
          skills: candidateForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
          work_mode: candidateForm.work_mode,
          city_hub: candidateForm.city_hub || null,
          has_completed_profile: candidateForm.has_completed_profile,
          has_completed_synergy_quiz: candidateForm.has_completed_synergy_quiz,
          has_completed_culture_game: candidateForm.has_completed_culture_game,
          synergy_scores: parsedSynergyScores,
          culture_preferences: parsedCulturePreferences,
        })
        .eq("id", editingCandidate.id);

      if (error) throw error;

      toast.success("Candidate updated successfully");
      setEditingCandidate(null);
      fetchCandidates();
    } catch (err) {
      console.error("Failed to save candidate:", err);
      toast.error("Failed to save candidate");
    } finally {
      setIsSaving(false);
    }
  };

  const getCityName = (cityId: string) => {
    return CITIES.find((c) => c.id === cityId)?.name || cityId;
  };

  const getRoleName = (roleId: string) => {
    return ROLES.find((r) => r.id === roleId)?.title || roleId;
  };

  // Filter candidates based on search and filter
  const filteredCandidates = candidates.filter((candidate) => {
    // Apply search filter
    const searchLower = candidateSearch.toLowerCase();
    const matchesSearch = !candidateSearch || 
      candidate.full_name?.toLowerCase().includes(searchLower) ||
      candidate.email?.toLowerCase().includes(searchLower) ||
      candidate.job_title?.toLowerCase().includes(searchLower) ||
      candidate.location?.toLowerCase().includes(searchLower) ||
      candidate.skills?.some(s => s.toLowerCase().includes(searchLower));
    
    // Apply completion filter
    const matchesFilter = 
      candidateFilter === "all" ||
      (candidateFilter === "complete" && candidate.has_completed_profile) ||
      (candidateFilter === "incomplete" && !candidate.has_completed_profile);
    
    return matchesSearch && matchesFilter;
  });

  // Create new job
  const createJob = async () => {
    if (!newJobForm.title.trim()) {
      toast.error("Job title is required");
      return;
    }
    
    setIsCreating(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .insert({
          title: newJobForm.title,
          company: newJobForm.company || "Emploid Test",
          city_id: newJobForm.city_id,
          role_id: newJobForm.role_id,
          user_id: TEST_EMPLOYER_ID,
          work_mode: newJobForm.work_mode,
          description: newJobForm.description || null,
          salary: newJobForm.salary || null,
          pay_min: newJobForm.pay_min ? parseInt(newJobForm.pay_min) : null,
          pay_max: newJobForm.pay_max ? parseInt(newJobForm.pay_max) : null,
          location_text: newJobForm.location_text || null,
          mission_statement: newJobForm.mission_statement || null,
          requirements: newJobForm.requirements.split("\n").filter(Boolean),
          is_complete: true,
          status: "active",
        });
      
      if (error) throw error;
      
      toast.success("Job created successfully");
      setShowCreateJob(false);
      setNewJobForm({
        title: "",
        company: "Emploid Test",
        city_id: "nyc",
        role_id: "growth",
        work_mode: "remote",
        description: "",
        salary: "",
        pay_min: "",
        pay_max: "",
        location_text: "",
        mission_statement: "",
        requirements: "",
      });
      fetchJobs();
    } catch (err) {
      console.error("Failed to create job:", err);
      toast.error("Failed to create job");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-amber-500" />
          Test Data Editor
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and edit test jobs and candidate profiles without logging in as users
        </p>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Test Jobs ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="candidates" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Candidates ({candidates.length})
          </TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Jobs created by test employer (ID: {TEST_EMPLOYER_ID.slice(0, 8)}...)
            </p>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={() => setShowCreateJob(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
              <Button variant="outline" size="sm" onClick={fetchJobs} disabled={isLoadingJobs}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingJobs ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {isLoadingJobs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No test jobs found
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {job.title}
                          {job.is_complete ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="h-3 w-3 mr-1" />
                              Draft
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {job.company} • {getCityName(job.city_id)}
                        </CardDescription>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openJobEditor(job)}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Role:</span>
                        <p className="font-medium">{getRoleName(job.role_id)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Work Mode:</span>
                        <p className="font-medium capitalize">{job.work_mode || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Salary:</span>
                        <p className="font-medium">{job.salary || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mission:</span>
                        <p className="font-medium truncate">
                          {job.mission_statement ? "✓ Set" : "✗ Missing"}
                        </p>
                      </div>
                    </div>
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {job.requirements.slice(0, 5).map((req, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {job.requirements.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.requirements.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, skills..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={candidateFilter} onValueChange={(v) => setCandidateFilter(v as typeof candidateFilter)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {filteredCandidates.length} of {candidates.length} candidates
              </p>
              <Button variant="outline" size="sm" onClick={fetchCandidates} disabled={isLoadingCandidates}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingCandidates ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {isLoadingCandidates ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCandidates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {candidateSearch || candidateFilter !== "all" 
                  ? "No candidates match your search" 
                  : "No candidates found"}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {candidate.avatar_url ? (
                          <img
                            src={candidate.avatar_url}
                            alt={candidate.full_name || ""}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">
                            {candidate.full_name || "Unnamed Candidate"}
                          </CardTitle>
                          <CardDescription>
                            {candidate.job_title || "No title"} • {candidate.location || "No location"}
                          </CardDescription>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openCandidateEditor(candidate)}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {candidate.has_completed_profile && (
                        <Badge variant="default" className="bg-green-500 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Profile Complete
                        </Badge>
                      )}
                      {candidate.has_completed_synergy_quiz && (
                        <Badge variant="default" className="bg-blue-500 text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Synergy Quiz
                        </Badge>
                      )}
                      {candidate.has_completed_culture_game && (
                        <Badge variant="default" className="bg-purple-500 text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Culture Game
                        </Badge>
                      )}
                      {!candidate.has_completed_profile && (
                        <Badge variant="secondary" className="text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          Incomplete
                        </Badge>
                      )}
                    </div>
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 6).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.skills.length - 6} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Job Editor Dialog */}
      <Dialog open={!!editingJob} onOpenChange={(open) => !open && setEditingJob(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Edit Job: {editingJob?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Work Mode</Label>
                  <Select
                    value={jobForm.work_mode}
                    onValueChange={(v) => setJobForm({ ...jobForm, work_mode: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pay Min ($K)</Label>
                  <Input
                    type="number"
                    value={jobForm.pay_min}
                    onChange={(e) => setJobForm({ ...jobForm, pay_min: e.target.value })}
                    placeholder="e.g. 100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pay Max ($K)</Label>
                  <Input
                    type="number"
                    value={jobForm.pay_max}
                    onChange={(e) => setJobForm({ ...jobForm, pay_max: e.target.value })}
                    placeholder="e.g. 150"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Salary Display</Label>
                <Input
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  placeholder="e.g. $100K - $150K"
                />
              </div>

              <div className="space-y-2">
                <Label>Location Text</Label>
                <Input
                  value={jobForm.location_text}
                  onChange={(e) => setJobForm({ ...jobForm, location_text: e.target.value })}
                  placeholder="e.g. New York, NY or Remote (US)"
                />
              </div>

              <div className="space-y-2">
                <Label>Mission Statement</Label>
                <Textarea
                  value={jobForm.mission_statement}
                  onChange={(e) => setJobForm({ ...jobForm, mission_statement: e.target.value })}
                  rows={2}
                  placeholder="What is the core mission of this role?"
                />
              </div>

              <div className="space-y-2">
                <Label>Big Rocks (JSON array)</Label>
                <Textarea
                  value={jobForm.big_rocks}
                  onChange={(e) => setJobForm({ ...jobForm, big_rocks: e.target.value })}
                  rows={4}
                  placeholder='[{"title": "Launch campaign", "description": "..."}]'
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Daily Stack (one per line)</Label>
                <Textarea
                  value={jobForm.daily_stack}
                  onChange={(e) => setJobForm({ ...jobForm, daily_stack: e.target.value })}
                  rows={3}
                  placeholder="Review analytics&#10;Team standups&#10;Content creation"
                />
              </div>

              <div className="space-y-2">
                <Label>Requirements/Skills (one per line)</Label>
                <Textarea
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  rows={3}
                  placeholder="Content Strategy&#10;SEO&#10;Email Marketing"
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={jobForm.is_complete}
                  onCheckedChange={(c) => setJobForm({ ...jobForm, is_complete: c })}
                />
                <Label>Published (visible to candidates)</Label>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingJob(null)}>
              Cancel
            </Button>
            <Button onClick={saveJob} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Candidate Editor Dialog */}
      <Dialog open={!!editingCandidate} onOpenChange={(open) => !open && setEditingCandidate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Edit Candidate: {editingCandidate?.full_name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={candidateForm.full_name}
                    onChange={(e) => setCandidateForm({ ...candidateForm, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={candidateForm.email}
                    onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input
                    value={candidateForm.job_title}
                    onChange={(e) => setCandidateForm({ ...candidateForm, job_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={candidateForm.location}
                    onChange={(e) => setCandidateForm({ ...candidateForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={candidateForm.bio}
                  onChange={(e) => setCandidateForm({ ...candidateForm, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Skills (comma-separated)</Label>
                <Textarea
                  value={candidateForm.skills}
                  onChange={(e) => setCandidateForm({ ...candidateForm, skills: e.target.value })}
                  rows={2}
                  placeholder="Content Strategy, SEO, Email Marketing, Analytics"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Work Mode</Label>
                  <Select
                    value={candidateForm.work_mode}
                    onValueChange={(v) => setCandidateForm({ ...candidateForm, work_mode: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City Hub</Label>
                  <Input
                    value={candidateForm.city_hub}
                    onChange={(e) => setCandidateForm({ ...candidateForm, city_hub: e.target.value })}
                    placeholder="e.g. new-york"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Synergy Scores (JSON)</Label>
                <Textarea
                  value={candidateForm.synergy_scores}
                  onChange={(e) => setCandidateForm({ ...candidateForm, synergy_scores: e.target.value })}
                  rows={4}
                  className="font-mono text-sm"
                  placeholder='{"autonomy": 7, "impact": 8, "collaboration": 6, "security": 5, "recognition": 7}'
                />
              </div>

              <div className="space-y-2">
                <Label>Culture Preferences (JSON)</Label>
                <Textarea
                  value={candidateForm.culture_preferences}
                  onChange={(e) => setCandidateForm({ ...candidateForm, culture_preferences: e.target.value })}
                  rows={4}
                  className="font-mono text-sm"
                  placeholder='{"innovation": 80, "workLifeBalance": 70, "collaboration": 85}'
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={candidateForm.has_completed_profile}
                    onCheckedChange={(c) => setCandidateForm({ ...candidateForm, has_completed_profile: c })}
                  />
                  <Label>Profile Complete</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={candidateForm.has_completed_synergy_quiz}
                    onCheckedChange={(c) => setCandidateForm({ ...candidateForm, has_completed_synergy_quiz: c })}
                  />
                  <Label>Synergy Quiz Complete</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={candidateForm.has_completed_culture_game}
                    onCheckedChange={(c) => setCandidateForm({ ...candidateForm, has_completed_culture_game: c })}
                  />
                  <Label>Culture Game Complete</Label>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCandidate(null)}>
              Cancel
            </Button>
            <Button onClick={saveCandidate} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Job Dialog */}
      <Dialog open={showCreateJob} onOpenChange={setShowCreateJob}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Test Job
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={newJobForm.title}
                    onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                    placeholder="e.g. Senior Growth Manager"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={newJobForm.company}
                    onChange={(e) => setNewJobForm({ ...newJobForm, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select
                    value={newJobForm.city_id}
                    onValueChange={(v) => setNewJobForm({ ...newJobForm, city_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Role Type</Label>
                  <Select
                    value={newJobForm.role_id}
                    onValueChange={(v) => setNewJobForm({ ...newJobForm, role_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Work Mode</Label>
                  <Select
                    value={newJobForm.work_mode}
                    onValueChange={(v) => setNewJobForm({ ...newJobForm, work_mode: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newJobForm.description}
                  onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the role..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Pay Min ($K)</Label>
                  <Input
                    type="number"
                    value={newJobForm.pay_min}
                    onChange={(e) => setNewJobForm({ ...newJobForm, pay_min: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pay Max ($K)</Label>
                  <Input
                    type="number"
                    value={newJobForm.pay_max}
                    onChange={(e) => setNewJobForm({ ...newJobForm, pay_max: e.target.value })}
                    placeholder="150"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salary Display</Label>
                  <Input
                    value={newJobForm.salary}
                    onChange={(e) => setNewJobForm({ ...newJobForm, salary: e.target.value })}
                    placeholder="$100K - $150K"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location Text</Label>
                <Input
                  value={newJobForm.location_text}
                  onChange={(e) => setNewJobForm({ ...newJobForm, location_text: e.target.value })}
                  placeholder="e.g. New York, NY or Remote (US)"
                />
              </div>

              <div className="space-y-2">
                <Label>Mission Statement</Label>
                <Textarea
                  value={newJobForm.mission_statement}
                  onChange={(e) => setNewJobForm({ ...newJobForm, mission_statement: e.target.value })}
                  rows={2}
                  placeholder="What is the core mission of this role?"
                />
              </div>

              <div className="space-y-2">
                <Label>Requirements/Skills (one per line)</Label>
                <Textarea
                  value={newJobForm.requirements}
                  onChange={(e) => setNewJobForm({ ...newJobForm, requirements: e.target.value })}
                  rows={4}
                  placeholder="Growth Marketing&#10;SEO&#10;Email Marketing&#10;Analytics"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateJob(false)}>
              Cancel
            </Button>
            <Button onClick={createJob} disabled={isCreating || !newJobForm.title.trim()}>
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
