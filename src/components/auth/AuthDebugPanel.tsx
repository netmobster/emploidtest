import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureToggle } from "@/contexts/FeatureToggleContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bug, 
  X, 
  User, 
  Key, 
  Database, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthDebugPanel() {
  const { user, session, profile, isLoading } = useAuth();
  const { testMode } = useFeatureToggle();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Only show in test mode
  if (!testMode.enabled) {
    return null;
  }

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const StatusIcon = ({ ok }: { ok: boolean }) => 
    ok ? (
      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
    ) : (
      <XCircle className="w-3.5 h-3.5 text-red-500" />
    );

  const DataRow = ({ 
    label, 
    value, 
    copyable = false 
  }: { 
    label: string; 
    value: string | null | undefined;
    copyable?: boolean;
  }) => (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <span className="font-mono text-foreground truncate max-w-[150px]">
          {value || "null"}
        </span>
        {copyable && value && (
          <button
            onClick={() => copyToClipboard(value, label)}
            className="p-0.5 hover:bg-muted rounded"
          >
            {copiedField === label ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          "fixed bottom-4 right-4 z-[100] w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors",
          isOpen 
            ? "bg-destructive text-destructive-foreground" 
            : "bg-amber-500 text-white hover:bg-amber-600"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Bug className="w-5 h-5" />}
      </motion.button>

      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-16 right-4 z-[100] w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-amber-500/10 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-sm">Auth Debug</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                Test Mode
              </Badge>
            </div>

            {/* Status Summary */}
            <div className="p-3 border-b border-border">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                  {isLoading ? (
                    <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                  ) : (
                    <StatusIcon ok={!!user} />
                  )}
                  <span className="text-[10px] text-muted-foreground mt-1">User</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                  {isLoading ? (
                    <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                  ) : (
                    <StatusIcon ok={!!session} />
                  )}
                  <span className="text-[10px] text-muted-foreground mt-1">Session</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                  {isLoading ? (
                    <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                  ) : (
                    <StatusIcon ok={!!profile} />
                  )}
                  <span className="text-[10px] text-muted-foreground mt-1">Profile</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="max-h-[300px] overflow-y-auto">
              {/* User Section */}
              <div className="p-3 border-b border-border">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium">User Details</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
                
                <DataRow label="Email" value={user?.email} />
                <DataRow label="ID" value={user?.id?.slice(0, 8) + "..."} copyable />
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <DataRow label="Provider" value={user?.app_metadata?.provider} />
                      <DataRow label="Created" value={user?.created_at?.slice(0, 10)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Session Section */}
              <div className="p-3 border-b border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium">Session</span>
                </div>
                <DataRow 
                  label="Access Token" 
                  value={session?.access_token ? session.access_token.slice(0, 12) + "..." : null} 
                  copyable 
                />
                <DataRow 
                  label="Expires" 
                  value={session?.expires_at ? new Date(session.expires_at * 1000).toLocaleTimeString() : null} 
                />
              </div>

              {/* Profile Section */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium">Profile</span>
                </div>
                <DataRow label="Type" value={profile?.user_type} />
                <DataRow label="Name" value={profile?.full_name} />
                <DataRow 
                  label="Profile Complete" 
                  value={profile?.has_completed_profile ? "Yes" : "No"} 
                />
                <DataRow 
                  label="Culture Game" 
                  value={profile?.has_completed_culture_game ? "Yes" : "No"} 
                />
                <DataRow 
                  label="Extended Profile" 
                  value={profile?.has_completed_extended_profile ? "Yes" : "No"} 
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 bg-muted/30 border-t border-border">
              <p className="text-[10px] text-muted-foreground text-center">
                Visible only in Test Mode • Disable in Admin Settings
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}