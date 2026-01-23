import { useState } from "react";
import { Linkedin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { importLinkedInProfile, isValidLinkedInUrl, LinkedInProfileData } from "@/lib/linkedInImport";
import { useAuth } from "@/contexts/AuthContext";
import { LinkedInReviewModal } from "./LinkedInReviewModal";

interface LinkedInImportButtonProps {
  userType: "candidate" | "employer";
  variant?: "default" | "compact";
  existingLinkedInUrl?: string;
  onImportComplete?: () => void;
}

export function LinkedInImportButton({
  userType,
  variant = "default",
  existingLinkedInUrl,
  onImportComplete,
}: LinkedInImportButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState(existingLinkedInUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [error, setError] = useState("");
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [importedData, setImportedData] = useState<LinkedInProfileData | null>(null);

  const isValidUrl = linkedInUrl.trim() === "" || isValidLinkedInUrl(linkedInUrl);

  const handleImport = async () => {
    if (!linkedInUrl.trim()) {
      setError("Please enter your LinkedIn URL");
      return;
    }

    if (!isValidLinkedInUrl(linkedInUrl)) {
      setError("Please enter a valid LinkedIn URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setSyncProgress(0);

    // Progress animation
    const progressInterval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const result = await importLinkedInProfile(linkedInUrl, user?.id, userType);

      clearInterval(progressInterval);
      setSyncProgress(100);

      if (result.success && result.data) {
        // Close URL dialog and open review modal
        setIsOpen(false);
        setImportedData(result.data);
        setShowReviewModal(true);
      } else if (result.requiresManualEntry) {
        // Show manual entry in review modal with empty data
        setIsOpen(false);
        setImportedData({
          fullName: null,
          headline: null,
          location: null,
          summary: null,
          skills: [],
          profilePictureUrl: null,
          companyName: null,
          industry: null,
          yearsOfExperience: null,
        });
        setShowReviewModal(true);
      } else {
        setError(result.error || "Failed to import profile");
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewModalClose = (open: boolean) => {
    setShowReviewModal(open);
    if (!open && onImportComplete) {
      onImportComplete();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {variant === "compact" ? (
            <Button variant="outline" size="sm" className="gap-2">
              <Linkedin className="w-4 h-4 text-[#0A66C2]" />
              Import from LinkedIn
            </Button>
          ) : (
            <Button variant="outline" className="w-full gap-2">
              <div className="p-1 rounded bg-[#0A66C2]/10">
                <Linkedin className="w-4 h-4 text-[#0A66C2]" />
              </div>
              Import from LinkedIn
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-[#0A66C2]" />
              Import from LinkedIn
            </DialogTitle>
            <DialogDescription>
              Enter your LinkedIn profile URL to auto-fill your profile
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Linkedin className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="font-medium">Syncing with LinkedIn...</p>
                <p className="text-sm text-muted-foreground">This may take a moment</p>
              </div>
              <div className="w-48 mx-auto">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${Math.min(syncProgress, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                <Input
                  id="linkedin-url"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedInUrl}
                  onChange={(e) => {
                    setLinkedInUrl(e.target.value);
                    setError("");
                  }}
                  className={!isValidUrl ? "border-destructive" : ""}
                />
                {!isValidUrl && (
                  <p className="text-sm text-destructive">
                    Please enter a valid LinkedIn URL
                  </p>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <Button
                onClick={handleImport}
                className="w-full"
                disabled={!linkedInUrl.trim()}
              >
                Start Import
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      {importedData && (
        <LinkedInReviewModal
          open={showReviewModal}
          onOpenChange={handleReviewModalClose}
          importedData={importedData}
          userType={userType}
          linkedinUrl={linkedInUrl}
        />
      )}
    </>
  );
}