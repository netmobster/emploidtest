import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFeatureToggle } from "@/contexts/FeatureToggleContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, Loader2, Mail, AlertCircle } from "lucide-react";
import { OTPVerificationModal } from "./OTPVerificationModal";
import { VerifiedDomainBadge } from "./VerifiedDomainBadge";

interface DomainVerificationSectionProps {
  companyWebsite?: string | null;
  isVerified?: boolean;
  verifiedDomain?: string | null;
  onVerificationComplete?: () => void;
}

export function DomainVerificationSection({
  companyWebsite,
  isVerified = false,
  verifiedDomain,
  onVerificationComplete,
}: DomainVerificationSectionProps) {
  const { testMode } = useFeatureToggle();
  const [workEmail, setWorkEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [extractedDomain, setExtractedDomain] = useState("");
  const [error, setError] = useState("");

  // Hide when test mode is ON (for easier testing)
  if (testMode.enabled) return null;

  // Show verified state if already verified
  if (isVerified) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg">Company Verified</CardTitle>
            <VerifiedDomainBadge domain={verifiedDomain} isVerified />
          </div>
          <CardDescription>
            Your company domain <span className="font-medium text-foreground">@{verifiedDomain}</span> has been verified.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const extractDomain = (email: string): string => {
    const match = email.match(/@(.+)$/);
    return match ? match[1].toLowerCase() : "";
  };

  const extractWebsiteDomain = (url: string | null | undefined): string => {
    if (!url) return "";
    try {
      // Remove protocol and www
      let domain = url.toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0];
      return domain;
    } catch {
      return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!workEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    const emailDomain = extractDomain(workEmail);
    const websiteDomain = extractWebsiteDomain(companyWebsite);

    // Validate domain matches company website
    if (websiteDomain && emailDomain !== websiteDomain) {
      setError(`Email domain must match your company website (${websiteDomain})`);
      return;
    }

    setIsLoading(true);
    try {
      // Send OTP to work email
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: workEmail,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        // Handle specific error cases
        if (otpError.message.includes("User not found")) {
          throw new Error("This email is not associated with your account. Please use your registered email or update your profile.");
        }
        throw otpError;
      }

      setExtractedDomain(emailDomain);
      setShowOTPModal(true);
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      console.error("OTP send error:", error);
      setError(error.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setWorkEmail("");
    setShowOTPModal(false);
    onVerificationComplete?.();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Verify Your Company</CardTitle>
          </div>
          <CardDescription>
            Verify your company domain to build trust with candidates. Enter your work email to receive a verification code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="work-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Work Email
              </Label>
              <Input
                id="work-email"
                type="email"
                placeholder={companyWebsite ? `you@${extractWebsiteDomain(companyWebsite)}` : "you@company.com"}
                value={workEmail}
                onChange={(e) => {
                  setWorkEmail(e.target.value);
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
              {companyWebsite && (
                <p className="text-xs text-muted-foreground">
                  Your email must match your company website: {extractWebsiteDomain(companyWebsite)}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isLoading || !workEmail} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verify Domain
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <OTPVerificationModal
        open={showOTPModal}
        onOpenChange={setShowOTPModal}
        email={workEmail}
        domain={extractedDomain}
        onSuccess={handleVerificationSuccess}
      />
    </>
  );
}
