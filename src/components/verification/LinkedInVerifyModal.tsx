import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Linkedin, CheckCircle, AlertCircle } from "lucide-react";

interface LinkedInVerifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

export function LinkedInVerifyModal({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: LinkedInVerifyModalProps) {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateLinkedInUrl = (url: string): boolean => {
    const regex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
    return regex.test(url);
  };

  const extractPublicIdentifier = (url: string): string => {
    const match = url.match(/linkedin\.com\/in\/([\w-]+)/i);
    return match ? match[1].toLowerCase() : "";
  };

  const handleVerify = async () => {
    setError("");

    if (!linkedinUrl) {
      setError("Please enter your LinkedIn profile URL");
      return;
    }

    if (!validateLinkedInUrl(linkedinUrl)) {
      setError("Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/yourname)");
      return;
    }

    setIsVerifying(true);
    try {
      // Call linkedin-import with verification mode
      const { data, error: functionError } = await supabase.functions.invoke(
        "linkedin-import",
        {
          body: {
            linkedinUrl,
            userId,
            userType: "candidate",
            verificationMode: true,
          },
        }
      );

      if (functionError) throw functionError;

      if (!data.success) {
        if (data.error?.includes("already linked")) {
          setError("This LinkedIn profile is already linked to another account");
          return;
        }
        throw new Error(data.error || "Verification failed");
      }

      // Extract identifier and update profile
      const linkedinIdentifier = extractPublicIdentifier(linkedinUrl);

      // Update profile with verification status
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          is_verified_identity: true,
          linked_provider_id: linkedinIdentifier,
          linkedin_url: linkedinUrl,
          linkedin_synced_at: new Date().toISOString(),
          // Also update profile data from LinkedIn if available
          ...(data.data?.fullName && { full_name: data.data.fullName }),
          ...(data.data?.headline && { job_title: data.data.headline }),
          ...(data.data?.location && { location: data.data.location }),
          ...(data.data?.summary && { bio: data.data.summary }),
          ...(data.data?.profilePictureUrl && { avatar_url: data.data.profilePictureUrl }),
          ...(data.data?.skills?.length && { skills: data.data.skills }),
          ...(data.data?.workHistory?.length && { work_history: data.data.workHistory }),
        })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      setIsSuccess(true);
      toast.success("Profile verified successfully!");

      // Close after showing success
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        setIsSuccess(false);
        setLinkedinUrl("");
      }, 1500);
    } catch (error: any) {
      console.error("LinkedIn verification error:", error);
      setError(error.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold">Verified!</h3>
            <p className="text-muted-foreground text-center">
              Your professional identity has been verified via LinkedIn.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-[#0A66C2]" />
            Verify Your Profile
          </DialogTitle>
          <DialogDescription>
            Link your LinkedIn profile to verify your professional identity. We'll
            import your profile data and add a verification badge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
            <Input
              id="linkedin-url"
              type="url"
              placeholder="https://linkedin.com/in/yourname"
              value={linkedinUrl}
              onChange={(e) => {
                setLinkedinUrl(e.target.value);
                setError("");
              }}
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">What happens next:</p>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>We verify you own this LinkedIn profile</li>
              <li>Your profile data is imported (name, title, skills)</li>
              <li>A "Verified Professional" badge appears on your profile</li>
            </ul>
          </div>

          <Button
            onClick={handleVerify}
            disabled={!linkedinUrl || isVerifying}
            className="w-full bg-[#0A66C2] hover:bg-[#004182]"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Linkedin className="mr-2 h-4 w-4" />
                Verify with LinkedIn
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
