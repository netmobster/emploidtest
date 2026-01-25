import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Globe, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmployerIdentityStepProps {
  onComplete: () => void;
}

export function EmployerIdentityStep({ onComplete }: EmployerIdentityStepProps) {
  const { profile, refreshProfile } = useAuth();
  const [companyName, setCompanyName] = useState(profile?.company_name || "");
  const [companyWebsite, setCompanyWebsite] = useState(profile?.company_website || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      toast.error("Please enter your company name");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: companyName.trim(),
          company_website: companyWebsite.trim() || null,
          has_completed_profile: true,
        })
        .eq("user_id", profile?.user_id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Company identity saved!");
      onComplete();
    } catch (error) {
      console.error("Error saving identity:", error);
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Let's verify your company identity
        </h2>
        <p className="text-muted-foreground">
          This builds trust with candidates and helps us match you better.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Company Name *
          </Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Inc."
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyWebsite" className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Company Website
          </Label>
          <Input
            id="companyWebsite"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            placeholder="https://acme.com"
            type="url"
          />
          <p className="text-xs text-muted-foreground">
            Adding your website helps verify your company and builds trust with candidates.
          </p>
        </div>

        {(profile as any)?.is_domain_verified && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Domain Verified</span>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !companyName.trim()}
          className="w-full gap-2"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}