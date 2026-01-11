import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Users, Eye, TrendingUp, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployerStats } from "@/hooks/useEmployerStats";
import { useEmployerJobs } from "@/hooks/useEmployerJobs";
import { useEmployerActivity } from "@/hooks/useEmployerActivity";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SynergyScoreChart } from "@/components/dashboard/SynergyScoreChart";
import { Category } from "@/data/questions";
import { JobCard } from "@/components/dashboard/JobCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { CompanyDetailsPanel } from "@/components/dashboard/CompanyDetailsPanel";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { QuickMatchPanel } from "@/components/testing/QuickMatchPanel";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/Logo";
import ProfileHeader from "@/components/ProfileHeader";

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const stats = useEmployerStats();
  const { jobs, isLoading: jobsLoading, deleteJob } = useEmployerJobs();
  const { activities, isLoading: activityLoading } = useEmployerActivity();
  const profileCompletion = useProfileCompletion(profile);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?type=employer");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleViewCandidates = (jobId: string) => {
    navigate(`/swipe/employer?job=${jobId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">
                  {profile?.company_name || "Dashboard"}
                </h1>
              </div>
            </div>
            
            <ProfileHeader />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your hiring activity.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Active Jobs"
            value={stats.totalJobs}
            icon={Briefcase}
            delay={0.1}
          />
          <StatsCard
            title="Total Matches"
            value={stats.totalMatches}
            icon={Users}
            delay={0.15}
          />
          <StatsCard
            title="Candidates Viewed"
            value={stats.totalSwipes}
            icon={Eye}
            delay={0.2}
          />
          <StatsCard
            title="Match Rate"
            value={`${stats.matchRate}%`}
            icon={TrendingUp}
            delay={0.25}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Jobs & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Postings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-6 shadow-card border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Your Job Postings</h3>
                <Button 
                  size="sm" 
                  onClick={() => navigate("/roles?type=employer")}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Job
                </Button>
              </div>

              {jobsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No jobs posted yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate("/roles?type=employer")}
                  >
                    Post Your First Job
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job, index) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onDelete={deleteJob}
                      onViewCandidates={handleViewCandidates}
                      delay={0.35 + index * 0.05}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl p-6 shadow-card border border-border"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
              
              {activityLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Start swiping to see matches here!
                  </p>
                </div>
              ) : (
                <div>
                  {activities.map((activity, index) => (
                    <ActivityItem
                      key={activity.id}
                      type={activity.type}
                      description={activity.description}
                      timestamp={activity.timestamp}
                      user={activity.user}
                      delay={0.45 + index * 0.05}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Quick Actions & Profile Completion */}
          <div className="space-y-6">
            <ProfileCompletionCard {...profileCompletion} />
            
            {/* Synergy Score Chart */}
            {profile?.synergy_scores && (
              <SynergyScoreChart scores={profile.synergy_scores as Record<Category, number>} />
            )}
            
            {/* Quick Match Panel for Testing */}
            <QuickMatchPanel />
            
            <QuickActionsPanel />

            {/* Recent Matches Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Recent Matches</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/matches")}
                >
                  See All
                </Button>
              </div>

              {stats.totalMatches === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No matches yet. Keep swiping!
                </p>
              ) : (
                <div className="space-y-3">
                  {activities
                    .filter((a) => a.type === "match")
                    .slice(0, 3)
                    .map((match) => (
                      <div key={match.id} className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={match.user?.avatar} />
                          <AvatarFallback className="text-xs">
                            {match.user?.name.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {match.user?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Company Details Panel */}
        {profile && (
          <div className="mt-6">
            <CompanyDetailsPanel 
              profile={{
                company_name: profile.company_name,
                bio: profile.bio,
                avatar_url: profile.avatar_url,
                company_website: profile.company_website,
                company_size: profile.company_size,
                company_industry: profile.company_industry,
                company_location: profile.company_location,
              }}
              onEditSuccess={refreshProfile}
            />
          </div>
        )}
      </main>
    </div>
  );
}