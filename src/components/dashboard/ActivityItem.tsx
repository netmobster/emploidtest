import { motion } from "framer-motion";
import { Heart, MessageCircle, UserCheck, Sparkles, LucideIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ActivityType = "match" | "message" | "like" | "super_like";

interface ActivityItemProps {
  type: ActivityType;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  delay?: number;
}

const activityConfig: Record<ActivityType, { icon: LucideIcon; color: string }> = {
  match: { icon: UserCheck, color: "text-success" },
  message: { icon: MessageCircle, color: "text-primary" },
  like: { icon: Heart, color: "text-accent" },
  super_like: { icon: Sparkles, color: "text-primary" },
};

export function ActivityItem({ type, description, timestamp, user, delay = 0 }: ActivityItemProps) {
  const config = activityConfig[type];
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 py-3 border-b border-border last:border-0"
    >
      <div className={`p-2 rounded-full bg-muted ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      
      {user && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="text-xs">
            {user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{description}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </p>
      </div>
    </motion.div>
  );
}