import { motion } from "framer-motion";
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  Sparkles,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useActivityDigest } from "@/hooks/useActivityDigest";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityFeedProps {
  userType: "employer" | "candidate";
}

export function ActivityFeed({ userType }: ActivityFeedProps) {
  const navigate = useNavigate();
  const { digest, isLoading } = useActivityDigest();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasActivity = digest.newMatches > 0 || 
    digest.unreadMessages > 0 || 
    digest.pendingInterviews > 0 ||
    (userType === "employer" && digest.newCandidatesMatchingRoles > 0) ||
    (userType === "candidate" && digest.newJobsMatchingProfile > 0);

  const getTimeAgoLabel = () => {
    if (digest.isFirstLogin) return "Welcome!";
    if (digest.daysSinceLastLogin === 0) return "Since your last visit today";
    if (digest.daysSinceLastLogin === 1) return "Since yesterday";
    return `Since ${digest.daysSinceLastLogin} days ago`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Activity Digest
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {getTimeAgoLabel()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {!hasActivity ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              No new activity since your last visit
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() =>
                navigate(
                  userType === "employer" ? "/swipe/employer" : "/city?type=candidate"
                )
              }
            >
              Start Exploring
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* New candidates/jobs */}
            {userType === "employer" && digest.newCandidatesMatchingRoles > 0 && (
              <ActivityItem
                icon={Users}
                iconColor="text-blue-500"
                iconBg="bg-blue-500/10"
                title={`${digest.newCandidatesMatchingRoles} new candidate${digest.newCandidatesMatchingRoles !== 1 ? 's' : ''}`}
                subtitle="matching your open roles joined"
                onClick={() => navigate("/swipe/employer")}
                actionLabel="View"
              />
            )}

            {userType === "candidate" && digest.newJobsMatchingProfile > 0 && (
              <ActivityItem
                icon={Briefcase}
                iconColor="text-green-500"
                iconBg="bg-green-500/10"
                title={`${digest.newJobsMatchingProfile} new job${digest.newJobsMatchingProfile !== 1 ? 's' : ''}`}
                subtitle="matching your profile posted"
                onClick={() => navigate("/city?type=candidate")}
                actionLabel="Browse"
              />
            )}

            {/* New matches */}
            {digest.newMatches > 0 && (
              <ActivityItem
                icon={Users}
                iconColor="text-primary"
                iconBg="bg-primary/10"
                title={`${digest.newMatches} new match${digest.newMatches !== 1 ? 'es' : ''}`}
                subtitle="waiting to connect"
                onClick={() => navigate("/matches")}
                actionLabel="View"
                highlight
              />
            )}

            {/* Unread messages */}
            {digest.unreadMessages > 0 && (
              <ActivityItem
                icon={MessageSquare}
                iconColor="text-orange-500"
                iconBg="bg-orange-500/10"
                title={`${digest.unreadMessages} unread message${digest.unreadMessages !== 1 ? 's' : ''}`}
                subtitle="from your matches"
                onClick={() => navigate("/matches")}
                actionLabel="Read"
              />
            )}

            {/* Pending interviews */}
            {digest.pendingInterviews > 0 && (
              <ActivityItem
                icon={Calendar}
                iconColor="text-purple-500"
                iconBg="bg-purple-500/10"
                title={`${digest.pendingInterviews} interview${digest.pendingInterviews !== 1 ? 's' : ''}`}
                subtitle={userType === "employer" ? "pending confirmation" : "scheduled"}
                onClick={() => navigate("/matches")}
                actionLabel="View"
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  onClick: () => void;
  actionLabel: string;
  highlight?: boolean;
}

function ActivityItem({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onClick,
  actionLabel,
  highlight,
}: ActivityItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
        highlight 
          ? "bg-primary/5 border border-primary/20 hover:bg-primary/10" 
          : "bg-muted/30 hover:bg-muted/50"
      }`}
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <Button size="sm" variant={highlight ? "default" : "ghost"} className="flex-shrink-0">
        {actionLabel}
      </Button>
    </motion.div>
  );
}
