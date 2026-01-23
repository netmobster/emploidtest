import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, X, Plus, User, Building2, Loader2, CheckCircle2, Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LinkedInProfileData } from "@/lib/linkedInImport";

interface LinkedInReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importedData: LinkedInProfileData;
  userType: "candidate" | "employer";
  linkedinUrl?: string;
}

export function LinkedInReviewModal({
  open,
  onOpenChange,
  importedData,
  userType,
  linkedinUrl,
}: LinkedInReviewModalProps) {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [fullName, setFullName] = useState(importedData.fullName || "");
  const [headline, setHeadline] = useState(importedData.headline || "");
  const [summary, setSummary] = useState(importedData.summary || "");
  const [location, setLocation] = useState(importedData.location || "");
  const [skills, setSkills] = useState<string[]>(importedData.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(importedData.profilePictureUrl || null);
  const [companyName, setCompanyName] = useState(importedData.companyName || "");
  const [industry, setIndustry] = useState(importedData.industry || "");

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update state when importedData changes
  useEffect(() => {
    setFullName(importedData.fullName || "");
    setHeadline(importedData.headline || "");
    setSummary(importedData.summary || "");
    setLocation(importedData.location || "");
    setSkills(importedData.skills || []);
    setAvatarUrl(importedData.profilePictureUrl || null);
    setCompanyName(importedData.companyName || "");
    setIndustry(importedData.industry || "");
  }, [importedData]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      const bucketName = userType === "employer" ? "company-logos" : "candidate-avatars";

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
      toast.success("Photo uploaded!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill) && skills.length < 15) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!fullName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsSaving(true);
    try {
      const updateData: Record<string, any> = {
        full_name: fullName.trim(),
        bio: summary.trim() || null,
        avatar_url: avatarUrl,
        location: location.trim() || null,
        job_title: headline.trim() || null,
        skills: skills.length > 0 ? skills : null,
        linkedin_url: linkedinUrl || null,
        has_completed_profile: true,
        updated_at: new Date().toISOString(),
      };

      // Add employer-specific fields
      if (userType === "employer") {
        updateData.company_name = companyName.trim() || null;
        updateData.company_industry = industry.trim() || null;
        updateData.company_location = location.trim() || null;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Profile saved successfully! 🎉");
      onOpenChange(false);

      // Navigate to dashboard
      navigate(userType === "employer" ? "/employer-dashboard" : "/candidate-dashboard");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Review Your Import
          </DialogTitle>
          <DialogDescription>
            We grabbed your LinkedIn data! Review and refine before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-5 gap-6 mt-4">
          {/* Form Section - 3 cols */}
          <div className="md:col-span-3 space-y-4">
            {/* Photo Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {fullName?.slice(0, 2).toUpperCase() || (userType === "employer" ? <Building2 /> : <User />)}
                  </AvatarFallback>
                </Avatar>
                {!avatarUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 rounded-full border-2 border-dashed border-destructive/50">
                    <Camera className="w-6 h-6 text-destructive/70" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant={avatarUrl ? "outline" : "default"}
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {avatarUrl ? "Change Photo" : "Add a Photo"}
                </Button>
                {!avatarUrl && (
                  <p className="text-xs text-destructive">
                    No photo found - add one to stand out!
                  </p>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="headline">Title / Headline</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            {/* Company (employer only) */}
            {userType === "employer" && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Inc."
                />
              </div>
            )}

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            {/* Bio / Mission */}
            <div className="space-y-2">
              <Label htmlFor="summary">
                {userType === "employer" ? "Mission / Bio" : "About You"}
              </Label>
              <Textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills ({skills.length}/15)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={skills.length >= 15}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddSkill}
                  disabled={skills.length >= 15}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 hover:text-destructive rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview Section - 2 cols */}
          <div className="md:col-span-2">
            <div className="sticky top-0">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Profile Preview
              </p>
              <Card className="overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-primary/30 to-primary/10" />
                <CardContent className="pt-0 -mt-8">
                  <Avatar className="h-16 w-16 border-4 border-background">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {fullName?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mt-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {fullName || "Your Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {headline || "Your title"}
                    </p>
                    {location && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 {location}
                      </p>
                    )}
                    {userType === "employer" && companyName && (
                      <p className="text-xs text-muted-foreground">
                        🏢 {companyName}
                      </p>
                    )}
                  </div>
                  {summary && (
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-3">
                      {summary}
                    </p>
                  )}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {skills.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs py-0">
                          {skill}
                        </Badge>
                      ))}
                      {skills.length > 5 && (
                        <Badge variant="outline" className="text-xs py-0">
                          +{skills.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Looks Great, Save Profile!
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}