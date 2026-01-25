import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Heart, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickAction {
  label: string;
  icon: typeof Search;
  path: string;
}

const actions: QuickAction[] = [
  { label: "Find Candidates", icon: Search, path: "/city?type=employer" },
  { label: "View Matches", icon: Heart, path: "/matches" },
  { label: "Edit Culture", icon: Settings, path: "/culture-edit" },
  { label: "Post New Job", icon: Plus, path: "/roles?type=employer" },
];

export function QuickActionsPanel() {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-xl p-4 shadow-card border border-border"
    >
      <h3 className="font-semibold text-foreground mb-3 text-sm">Quick Actions</h3>
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <Tooltip key={action.label}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(action.path)}
                className="h-9 w-9"
              >
                <action.icon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{action.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </motion.div>
  );
}