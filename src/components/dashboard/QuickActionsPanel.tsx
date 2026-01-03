import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Heart, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickAction {
  label: string;
  icon: typeof Search;
  path: string;
  variant?: "default" | "outline";
}

const actions: QuickAction[] = [
  { label: "Find Candidates", icon: Search, path: "/city?type=employer", variant: "default" },
  { label: "View Matches", icon: Heart, path: "/matches", variant: "outline" },
  { label: "Edit Culture", icon: Settings, path: "/culture-edit", variant: "outline" },
  { label: "Post New Job", icon: Plus, path: "/roles?type=employer", variant: "outline" },
];

export function QuickActionsPanel() {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-xl p-5 shadow-card border border-border"
    >
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="w-full justify-start"
            onClick={() => navigate(action.path)}
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </div>
    </motion.div>
  );
}