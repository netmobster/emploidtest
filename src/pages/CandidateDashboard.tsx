import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Users, Eye, TrendingUp, Bookmark, Loader2, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCandidateStats } from "@/hooks/useCandidateStats";
import { useJobRecommendations } from "@/hooks/useJobRecommendations";
import { useMatches } from "@/hooks/useMatches";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SynergyScoreChart } from "@/components/dashboard/SynergyScoreChart";
import { Category } from "@/data/questions";
import { JobRecommendationCard } from "@/components/dashboard/JobRecommendationCard";
import { EditCandidateProfileDialog } from "@/components/dashboard/EditCandidateProfileDialog";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/Logo";
import ProfileHeader from "@/components/ProfileHeader";

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const stats = useCandidateStats();
  const { jobs, isLoading: jobsLoading } = useJobRecommendations();
  const { matches, isLoading: matchesLoading } = useMatches();
  const profileCompletion = useProfileCompletion(profile);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?type=candidate");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleViewJob = (jobId: string) => {
    navigate(`/swipe/candidate`);
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
                  Job Dashboard
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
            Here's an overview of your job search activity.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Saved Jobs"
            value={stats.savedJobs}
            icon={Bookmark}
            delay={0.1}
            onClick={() => navigate("/swipe/candidate")}
          />
          <StatsCard
            title="Total Matches"
            value={stats.totalMatches}
            icon={Users}
            delay={0.15}
            onClick={() => navigate("/matches")}
          />
          <StatsCard
            title="Jobs Viewed"
            value={stats.jobsViewed}
            icon={Eye}
            delay={0.2}
            onClick={() => navigate("/swipe/candidate")}
          />
          <StatsCard
            title="Match Rate"
            value={`${stats.matchRate}%`}
            icon={TrendingUp}
            delay={0.25}
            onClick={() => navigate("/matches")}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Job Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-6 shadow-card border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Job Recommendations</h3>
                <Button 
                  size="sm" 
                  onClick={() => navigate("/swipe/candidate")}
                >
                  Browse All
                </Button>
              </div>

              {jobsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No new job recommendations</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate("/swipe/candidate")}
                  >
                    Start Browsing Jobs
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job, index) => (
                    <JobRecommendationCard
                      key={job.id}
                      job={job}
                      onView={handleViewJob}
                      delay={0.35 + index * 0.05}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Matches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl p-6 shadow-card border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Recent Matches</h3>
                <Button 
                  variant="ghost"
                  size="sm" 
                  onClick={() => navigate("/matches")}
                >
                  See All
                </Button>
              </div>
              
              {matchesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No matches yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Start swiping to connect with employers!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                {matches.slice(0, 5).map((match) => (
                    <div 
                      key={match.id} 
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/chat/${match.id}`)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={match.other_user?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {match.other_user?.full_name?.slice(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {match.other_user?.full_name || "Unknown"}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Chat
                      </Button>
                    </div>
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
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border"
            >
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/swipe/candidate")}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/matches")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Matches
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/game/culture")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Update Preferences
                </Button>
              </div>
            </motion.div>

            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Your Profile</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setEditProfileOpen(true)}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {profile?.full_name?.slice(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{profile?.full_name || "Your Name"}</p>
                  <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
                  {profile?.bio && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{profile.bio}</p>
                  )}
                </div>
              </div>
              {!profile?.has_completed_culture_game && (
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-foreground mb-2">Complete your profile</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Take the culture game to get better job matches!
                  </p>
                  <Button size="sm" onClick={() => navigate("/game/culture")}>
                    Take Culture Game
                  </Button>
                </div>
              )}
            </motion.div>

            <EditCandidateProfileDialog
              open={editProfileOpen}
              onOpenChange={setEditProfileOpen}
              onSuccess={() => {
                setEditProfileOpen(false);
                refreshProfile();
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
