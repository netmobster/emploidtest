import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Sparkles, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePendingLikes } from "@/hooks/usePendingLikes";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export function PendingLikesCard() {
  const navigate = useNavigate();
  const { pendingLikes, isLoading } = usePendingLikes();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card rounded-xl p-4 sm:p-6 shadow-card border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (pendingLikes.length === 0) {
    return null; // Don't show the card if no pending likes
  }

  const handleViewProfile = (userId: string, userType: string) => {
    const path = userType === "employer" 
      ? `/company/${userId}` 
      : `/candidate/${userId}`;
    navigate(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-card rounded-xl p-4 sm:p-6 shadow-card border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground">
            Pending Likes
          </h3>
          <Badge variant="secondary" className="text-xs">
            {pendingLikes.length}
          </Badge>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Waiting for them to like you back
      </p>

      <div className="space-y-3">
        {pendingLikes.slice(0, 5).map((like, index) => (
          <motion.div
            key={like.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
            onClick={() => handleViewProfile(like.swiped_id, like.profile?.user_type || "candidate")}
          >
            <div className="relative">
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarImage src={like.profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {like.profile?.full_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              {like.direction === "super_like" && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {like.profile?.full_name || "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {like.profile?.job_title || like.profile?.user_type || ""}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(like.created_at), { addSuffix: false })}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>

      {pendingLikes.length > 5 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-muted-foreground"
        >
          View all {pendingLikes.length} pending likes
        </Button>
      )}
    </motion.div>
  );
}
