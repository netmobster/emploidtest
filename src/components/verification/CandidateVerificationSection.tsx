import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFeatureToggle } from "@/contexts/FeatureToggleContext";
import { BadgeCheck, Linkedin } from "lucide-react";
import { LinkedInVerifyModal } from "./LinkedInVerifyModal";
import { VerifiedProfessionalBadge } from "./VerifiedProfessionalBadge";

interface CandidateVerificationSectionProps {
  userId: string;
  isVerified?: boolean;
  onVerificationComplete?: () => void;
}

export function CandidateVerificationSection({
  userId,
  isVerified = false,
  onVerificationComplete,
}: CandidateVerificationSectionProps) {
  const { testMode } = useFeatureToggle();
  const [showModal, setShowModal] = useState(false);

  // Hide when test mode is ON (for easier testing)
  if (testMode.enabled) return null;

  // Show verified state if already verified
  if (isVerified) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg">Identity Verified</CardTitle>
            <VerifiedProfessionalBadge isVerified />
          </div>
          <CardDescription>
            Your professional identity has been verified via LinkedIn.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Verify Your Profile</CardTitle>
          </div>
          <CardDescription>
            Verify your professional identity via LinkedIn to build trust with employers and stand out in matches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowModal(true)}
            className="w-full bg-[#0A66C2] hover:bg-[#004182]"
          >
            <Linkedin className="mr-2 h-4 w-4" />
            Verify with LinkedIn
          </Button>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            We'll import your profile data and add a verification badge
          </p>
        </CardContent>
      </Card>

      <LinkedInVerifyModal
        open={showModal}
        onOpenChange={setShowModal}
        userId={userId}
        onSuccess={() => {
          setShowModal(false);
          onVerificationComplete?.();
        }}
      />
    </>
  );
}
