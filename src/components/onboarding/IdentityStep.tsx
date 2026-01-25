import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LinkedInImportButton } from "@/components/profile/LinkedInImportButton";
import { Loader2, ArrowRight, User, Briefcase, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface IdentityStepProps {
  onComplete: () => void;
}

export function IdentityStep({ onComplete }: IdentityStepProps) {
  const { user, refreshProfile, profile } = useAuth();
  const [showManualForm, setShowManualForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    job_title: profile?.job_title || "",
    location: profile?.location || "",
    bio: profile?.bio || "",
  });

  const handleLinkedInComplete = async () => {
    await refreshProfile();
    toast.success("Profile imported successfully!");
    onComplete();
  };

  const handleManualSubmit = async () => {
    if (!user) return;
    
    if (!formData.full_name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name.trim(),
          job_title: formData.job_title.trim() || null,
          location: formData.location.trim() || null,
          bio: formData.bio.trim() || null,
          has_completed_profile: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Profile saved!");
      onComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Let's start with who you are
        </h1>
        <p className="text-muted-foreground">
          This isn't a resume upload. We're building your professional identity.
        </p>
      </div>

      {!showManualForm ? (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <LinkedInImportButton
              userType="candidate"
              variant="default"
              onImportComplete={handleLinkedInComplete}
            />
            <p className="text-center text-sm text-muted-foreground mt-3">
              Recommended • Takes 30 seconds
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => setShowManualForm(true)}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Enter details manually
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="full_name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job Title
            </Label>
            <Input
              id="job_title"
              value={formData.job_title}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              placeholder="e.g. Senior Marketing Manager"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. New York, NY"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About You</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us a bit about yourself..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowManualForm(false)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleManualSubmit}
              disabled={isSaving || !formData.full_name.trim()}
              className="flex-1"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Continue
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
