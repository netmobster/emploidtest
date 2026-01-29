import { cn } from "@/lib/utils";
import {
  Users,
  Database,
  Mail,
  Bell,
  BarChart3,
  ToggleLeft,
  Settings,
  Shield,
  Home,
  FileText,
  FlaskConical,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/admin" },
  { id: "users", label: "Users", icon: Users, path: "/admin/users" },
  { id: "data", label: "Test Data", icon: Database, path: "/admin/data" },
  { id: "editor", label: "Data Editor", icon: FlaskConical, path: "/admin/editor" },
  { id: "chats", label: "Test Chats", icon: MessageSquare, path: "/admin/chats" },
  { id: "force-match", label: "Force Match", icon: Zap, path: "/admin/force-match" },
  { id: "emails", label: "Email Templates", icon: Mail, path: "/admin/emails" },
  { id: "broadcast", label: "Broadcast", icon: Bell, path: "/admin/broadcast" },
  { id: "toasts", label: "Toast Config", icon: FileText, path: "/admin/toasts" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { id: "features", label: "Feature Toggles", icon: ToggleLeft, path: "/admin/features" },
  { id: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
  { id: "audit", label: "Audit Logs", icon: Shield, path: "/admin/audit" },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Admin Panel
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Super Admin Access</p>
      </div>

      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive && "bg-primary/10 text-primary"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => navigate("/")}
        >
          <Home className="h-4 w-4" />
          Back to App
        </Button>
      </div>
    </aside>
  );
}
