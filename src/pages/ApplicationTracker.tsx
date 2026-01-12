import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  Clock, 
  Building2, 
  Loader2,
  MoreVertical,
  FileText,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import ProfileHeader from "@/components/ProfileHeader";
import { formatDistanceToNow } from "date-fns";

interface Application {
  id: string;
  job_id: string;
  match_id: string | null;
  status: "saved" | "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";
  notes: string | null;
  applied_at: string | null;
  updated_at: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    company: string;
    description: string | null;
    salary: string | null;
    type: string | null;
    remote: boolean | null;
    city_id: string;
    user_id: string | null;
  };
  employer_profile?: {
    avatar_url: string | null;
    company_name: string | null;
  };
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  saved: { label: "Saved", icon: FileText, color: "text-muted-foreground", bgColor: "bg-muted" },
  applied: { label: "Applied", icon: Send, color: "text-blue-600", bgColor: "bg-blue-100" },
  interviewing: { label: "Interviewing", icon: MessageCircle, color: "text-purple-600", bgColor: "bg-purple-100" },
  offered: { label: "Offered", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
  withdrawn: { label: "Withdrawn", icon: AlertCircle, color: "text-orange-600", bgColor: "bg-orange-100" },
};

export default function ApplicationTracker() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      fetchApplications();
    }
  }, [user, authLoading, navigate]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          id,
          job_id,
          match_id,
          status,
          notes,
          applied_at,
          updated_at,
          created_at,
          jobs (
            id,
            title,
            company,
            description,
            salary,
            type,
            remote,
            city_id,
            user_id
          )
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Fetch employer profiles
      const appsWithProfiles: Application[] = [];
      for (const app of data || []) {
        const job = app.jobs as any;
        let employerProfile = null;

        if (job?.user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("avatar_url, company_name")
            .eq("user_id", job.user_id)
            .maybeSingle();
          employerProfile = profile;
        }

        appsWithProfiles.push({
          id: app.id,
          job_id: app.job_id,
          match_id: app.match_id,
          status: app.status as Application["status"],
          notes: app.notes,
          applied_at: app.applied_at,
          updated_at: app.updated_at,
          created_at: app.created_at,
          job: {
            id: job.id,
            title: job.title,
            company: job.company,
            description: job.description,
            salary: job.salary,
            type: job.type,
            remote: job.remote,
            city_id: job.city_id,
            user_id: job.user_id,
          },
          employer_profile: employerProfile || undefined,
        });
      }

      setApplications(appsWithProfiles);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === "applied" && !applications.find(a => a.id === appId)?.applied_at) {
        updateData.applied_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("job_applications")
        .update(updateData)
        .eq("id", appId);

      if (error) throw error;

      setApplications(apps =>
        apps.map(app =>
          app.id === appId
            ? { ...app, status: newStatus as Application["status"], ...updateData }
            : app
        )
      );

      toast.success(`Status updated to ${statusConfig[newStatus].label}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const saveNotes = async (appId: string) => {
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ notes: notesValue, updated_at: new Date().toISOString() })
        .eq("id", appId);

      if (error) throw error;

      setApplications(apps =>
        apps.map(app =>
          app.id === appId ? { ...app, notes: notesValue } : app
        )
      );

      setEditingNotes(null);
      toast.success("Notes saved");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    }
  };

  const deleteApplication = async (appId: string) => {
    try {
      const { error } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", appId);

      if (error) throw error;

      setApplications(apps => apps.filter(app => app.id !== appId));
      toast.success("Application removed");
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to remove application");
    }
  };

  const filteredApps = useMemo(() => {
    if (activeTab === "all") return applications;
    return applications.filter(app => app.status === activeTab);
  }, [applications, activeTab]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: applications.length };
    applications.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  }, [applications]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Logo size="sm" />
              <h1 className="text-lg font-semibold text-foreground hidden sm:block">
                Application Tracker
              </h1>
            </div>
            <ProfileHeader />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Track Your Applications</h2>
          </div>
          <p className="text-muted-foreground">
            Manage and track the status of your job applications
          </p>
        </motion.div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all" className="gap-1.5">
              All
              <Badge variant="secondary" className="ml-1">{statusCounts.all || 0}</Badge>
            </TabsTrigger>
            {Object.entries(statusConfig).map(([key, config]) => (
              <TabsTrigger key={key} value={key} className="gap-1.5">
                <config.icon className="w-3.5 h-3.5" />
                {config.label}
                {statusCounts[key] > 0 && (
                  <Badge variant="secondary" className="ml-1">{statusCounts[key]}</Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Briefcase className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {activeTab === "all" ? "No applications yet" : `No ${statusConfig[activeTab]?.label.toLowerCase()} applications`}
            </h3>
            <p className="text-muted-foreground mb-6">
              Start tracking your job applications to stay organized
            </p>
            <Button onClick={() => navigate("/saved-jobs")}>
              View Saved Jobs
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredApps.map((app, index) => {
                const status = statusConfig[app.status];
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl p-5 shadow-card border border-border"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14 flex-shrink-0">
                        <AvatarImage src={app.employer_profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Building2 className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-foreground text-lg truncate">
                              {app.job.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {app.employer_profile?.company_name || app.job.company}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Status Badge */}
                            <Badge className={`${status.bgColor} ${status.color} gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </Badge>

                            {/* Actions Menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {app.match_id && (
                                  <DropdownMenuItem onClick={() => navigate(`/chat/${app.match_id}`)}>
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Open Chat
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => {
                                  setEditingNotes(app.id);
                                  setNotesValue(app.notes || "");
                                }}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  {app.notes ? "Edit Notes" : "Add Notes"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deleteApplication(app.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Job Details */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {app.job.city_id && (
                            <Badge variant="secondary" className="gap-1">
                              <MapPin className="w-3 h-3" />
                              {app.job.city_id}
                            </Badge>
                          )}
                          {app.job.type && (
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="w-3 h-3" />
                              {app.job.type}
                            </Badge>
                          )}
                          {app.job.remote && (
                            <Badge variant="outline">Remote</Badge>
                          )}
                          {app.job.salary && (
                            <Badge variant="outline">{app.job.salary}</Badge>
                          )}
                        </div>

                        {/* Status Selector */}
                        <div className="flex items-center gap-3 mt-4">
                          <span className="text-sm text-muted-foreground">Update status:</span>
                          <Select value={app.status} onValueChange={(val) => updateStatus(app.id, val)}>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <config.icon className="w-3.5 h-3.5" />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Notes Section */}
                        {editingNotes === app.id ? (
                          <div className="mt-4 space-y-2">
                            <Textarea
                              value={notesValue}
                              onChange={(e) => setNotesValue(e.target.value)}
                              placeholder="Add notes about this application..."
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveNotes(app.id)}>
                                Save Notes
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingNotes(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : app.notes ? (
                          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">Notes:</p>
                            {app.notes}
                          </div>
                        ) : null}

                        {/* Timestamps */}
                        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                          {app.applied_at && (
                            <span>Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}</span>
                          )}
                          <span>Updated {formatDistanceToNow(new Date(app.updated_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
