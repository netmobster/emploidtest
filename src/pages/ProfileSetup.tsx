import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, User, Building2 } from "lucide-react";
import Logo from "@/components/Logo";
import OnboardingProgress from "@/components/OnboardingProgress";
import LinkedInImportSection from "@/components/profile/LinkedInImportSection";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { getCompletionMessage, LinkedInProfileData } from "@/lib/linkedInImport";
import MainLayout from "@/components/layout/MainLayout";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const profileCompletion = useProfileCompletion(profile as any);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importCompletionMessage, setImportCompletionMessage] = useState<string | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Employer-specific fields
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");

  const handleLinkedInImport = (data: LinkedInProfileData) => {
    // Auto-fill form fields with imported data
    if (data.fullName) setFullName(data.fullName);
    if (data.summary) setBio(data.summary);
    if (data.companyName) setCompanyName(data.companyName);
    if (data.industry) setCompanyIndustry(data.industry);
    if (data.location) setCompanyLocation(data.location);
    
    // Calculate completion message
    const incompleteItems = profileCompletion.items
      .filter(item => !item.completed && !item.comingSoon)
      .map(item => item.label);
    
    const message = getCompletionMessage(
      profileCompletion.percentage,
      "employer",
      incompleteItems
    );
    setImportCompletionMessage(message);
    
    toast.success("Profile data imported! Review and save your changes.");
  };

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
      return;
    }
    
    // Pre-fill with existing data
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || null);
      setCompanyName(profile.company_name || "");
      setCompanyWebsite(profile.company_website || "");
      setCompanySize(profile.company_size || "");
      setCompanyIndustry(profile.company_industry || "");
      setCompanyLocation(profile.company_location || "");
    }
  }, [user, profile, isLoading, navigate]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const bucketName = profile?.user_type === 'employer' ? 'company-logos' : 'candidate-avatars';

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    
    if (profile?.user_type === 'employer' && !companyName.trim()) {
      toast.error("Please enter your company name");
      return;
    }

    setIsSaving(true);
    try {
      const updateData: any = {
        full_name: fullName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
        has_completed_profile: true,
        updated_at: new Date().toISOString(),
      };

      if (profile?.user_type === 'employer') {
        updateData.company_name = companyName.trim();
        updateData.company_website = companyWebsite.trim();
        updateData.company_size = companySize.trim();
        updateData.company_industry = companyIndustry.trim();
        updateData.company_location = companyLocation.trim();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user?.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Profile saved successfully!");

      // Navigate to culture game
      if (profile?.user_type === 'employer') {
        navigate("/employer-onboarding");
      } else {
        navigate("/candidate-onboarding");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isEmployer = profile?.user_type === 'employer';

  return (
    <MainLayout variant="default">
      <div className="py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
        <div className="text-center mb-6">
          <Logo size="md" className="mx-auto mb-4" />
          <OnboardingProgress currentStep="profile" className="mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground">
            {isEmployer 
              ? "Tell us about yourself and your company" 
              : "Let candidates know who you are"}
          </p>
        </div>

        {/* LinkedIn Import Section - Always visible */}
        {isEmployer && (
          <div className="mb-6">
            <LinkedInImportSection
              userType="employer"
              onImportSuccess={handleLinkedInImport}
              completionPercentage={profileCompletion.percentage}
              completionMessage={importCompletionMessage || undefined}
            />
          </div>
        )}

        <div className="bg-card rounded-2xl p-6 shadow-elegant">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10">
                  {isEmployer ? (
                    <Building2 className="w-10 h-10 text-primary" />
                  ) : (
                    <User className="w-10 h-10 text-primary" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {isEmployer ? "Upload Logo" : "Upload Photo"}
                </Button>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">
                {isEmployer ? "Your Role / Bio" : "Bio / Headline"}
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={isEmployer 
                  ? "e.g., CEO & Founder, passionate about building great teams"
                  : "e.g., Full-stack developer with 5 years of experience"}
                rows={3}
              />
            </div>

            {/* Employer-specific fields */}
            {isEmployer && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Input
                      id="companySize"
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      placeholder="e.g., 10-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyIndustry">Industry</Label>
                    <Input
                      id="companyIndustry"
                      value={companyIndustry}
                      onChange={(e) => setCompanyIndustry(e.target.value)}
                      placeholder="e.g., Technology"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyLocation">Location</Label>
                  <Input
                    id="companyLocation"
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Continue to Culture Questions
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
    </MainLayout>
  );
};

export default ProfileSetup;
