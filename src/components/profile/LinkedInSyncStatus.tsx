import { useState } from "react";
import { Linkedin, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { formatSyncTime, importLinkedInProfile, LinkedInProfileData } from "@/lib/linkedInImport";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LinkedInReviewModal } from "./LinkedInReviewModal";

interface LinkedInSyncStatusProps {
  linkedinUrl: string | null;
  linkedinSyncedAt: string | null;
  userType: "candidate" | "employer";
  onSyncComplete?: () => void;
}

export function LinkedInSyncStatus({
  linkedinUrl,
  linkedinSyncedAt,
  userType,
  onSyncComplete,
}: LinkedInSyncStatusProps) {
  const { user, refreshProfile } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [importedData, setImportedData] = useState<LinkedInProfileData | null>(null);

  if (!linkedinUrl) {
    return null;
  }

  const handleResync = async () => {
    if (!linkedinUrl || !user) return;

    setIsSyncing(true);
    try {
      const result = await importLinkedInProfile(linkedinUrl, user.id, userType);

      if (result.success && result.data) {
        // Show review modal with new data
        setImportedData(result.data);
        setShowReviewModal(true);
      } else {
        toast.error(result.message || "Failed to sync with LinkedIn");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync with LinkedIn");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReviewModalClose = (open: boolean) => {
    setShowReviewModal(open);
    if (!open) {
      refreshProfile();
      onSyncComplete?.();
    }
  };

  const syncTimeDisplay = formatSyncTime(linkedinSyncedAt);
  const hasRecentSync = linkedinSyncedAt && 
    (new Date().getTime() - new Date(linkedinSyncedAt).getTime()) < 24 * 60 * 60 * 1000;

  return (
    <>
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-[#0A66C2]/10">
            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground">LinkedIn Connected</p>
            <p className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {hasRecentSync ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Synced {syncTimeDisplay}
                </span>
              ) : (
                `Last synced: ${syncTimeDisplay}`
              )}
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleResync}
          disabled={isSyncing}
          className="gap-2"
        >
          <motion.div
            animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isSyncing ? Infinity : 0, ease: "linear" }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.div>
          {isSyncing ? "Syncing..." : "Re-sync"}
        </Button>
      </div>

      {/* Review Modal */}
      {importedData && (
        <LinkedInReviewModal
          open={showReviewModal}
          onOpenChange={handleReviewModalClose}
          importedData={importedData}
          userType={userType}
          linkedinUrl={linkedinUrl}
        />
      )}
    </>
  );
}