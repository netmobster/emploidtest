import { motion } from "framer-motion";
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ChannelStatus = "connecting" | "connected" | "disconnected" | "error";

interface ConnectionStatusBadgeProps {
  status: ChannelStatus;
  className?: string;
}

const statusConfig: Record<ChannelStatus, { 
  icon: React.ElementType; 
  label: string; 
  tooltip: string;
  color: string;
}> = {
  connecting: {
    icon: RefreshCw,
    label: "Connecting",
    tooltip: "Establishing real-time connection...",
    color: "text-amber-500",
  },
  connected: {
    icon: Wifi,
    label: "Live",
    tooltip: "Real-time updates active",
    color: "text-emerald-500",
  },
  disconnected: {
    icon: WifiOff,
    label: "Offline",
    tooltip: "Using fallback polling (30s refresh)",
    color: "text-muted-foreground",
  },
  error: {
    icon: AlertTriangle,
    label: "Reconnecting",
    tooltip: "Connection lost, auto-reconnecting...",
    color: "text-destructive",
  },
};

export function ConnectionStatusBadge({ status, className }: ConnectionStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
              "bg-secondary/50 backdrop-blur-sm border border-border",
              className
            )}
          >
            <motion.div
              animate={status === "connecting" ? { rotate: 360 } : {}}
              transition={status === "connecting" ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              <Icon className={cn("w-3 h-3", config.color)} />
            </motion.div>
            <span className={config.color}>{config.label}</span>
            {status === "connected" && (
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
