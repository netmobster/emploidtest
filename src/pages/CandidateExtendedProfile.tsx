import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Linkedin, Globe, Briefcase, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LinkedInImportSection from "@/components/profile/LinkedInImportSection";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { getCompletionMessage, LinkedInProfileData } from "@/lib/linkedInImport";

const formSchema = z.object({
  linkedin_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  website_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  portfolio_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  job_title: z.string().min(1, "Job title is required"),
  location: z.string().min(1, "Location is required"),
  years_of_experience: z.string().min(1, "Please select your experience level"),
  availability: z.string().min(1, "Please select your availability"),
  remote_preference: z.string().min(1, "Please select your work preference"),
});

type FormData = z.infer<typeof formSchema>;

const experienceOptions = [
  { value: "0-1", label: "0-1 years" },
  { value: "1-3", label: "1-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
];

const availabilityOptions = [
  { value: "immediately", label: "Immediately" },
  { value: "2-weeks", label: "2 weeks notice" },
  { value: "1-month", label: "1 month notice" },
  { value: "3-months", label: "3+ months" },
];

const remoteOptions = [
  { value: "remote", label: "Remote only" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
  { value: "flexible", label: "Flexible" },
];

const CandidateExtendedProfile = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const profileCompletion = useProfileCompletion(profile as any);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importCompletionMessage, setImportCompletionMessage] = useState<string | null>(null);

  const handleLinkedInImport = (data: LinkedInProfileData) => {
    // Auto-fill form fields with imported data
    if (data.headline) form.setValue("job_title", data.headline);
    if (data.location) form.setValue("location", data.location);
    if (data.skills && data.skills.length > 0) {
      setSkills(prev => {
        const combined = [...new Set([...prev, ...data.skills])];
        return combined.slice(0, 15); // Max 15 skills
      });
    }
    if (data.yearsOfExperience) form.setValue("years_of_experience", data.yearsOfExperience);
    
    // Calculate completion message
    const incompleteItems = profileCompletion.items
      .filter(item => !item.completed && !item.comingSoon)
      .map(item => item.label);
    
    const message = getCompletionMessage(
      profileCompletion.percentage,
      "candidate",
      incompleteItems
    );
    setImportCompletionMessage(message);
    
    toast.success("Profile data imported! Review and save your changes.");
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      linkedin_url: "",
      website_url: "",
      portfolio_url: "",
      job_title: "",
      location: "",
      years_of_experience: "",
      availability: "",
      remote_preference: "",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (profile) {
      form.reset({
        linkedin_url: profile.linkedin_url || "",
        website_url: profile.website_url || "",
        portfolio_url: profile.portfolio_url || "",
        job_title: profile.job_title || "",
        location: profile.location || "",
        years_of_experience: profile.years_of_experience || "",
        availability: profile.availability || "",
        remote_preference: profile.remote_preference || "",
      });
      setSkills(profile.skills || []);
      setResumeUrl(profile.resume_url || null);
      setCoverImageUrl(profile.cover_image_url || null);
    }
  }, [user, profile, navigate, form]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 15) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setResumeFile(file);

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/resume.${fileExt}`;

    const { error } = await supabase.storage
      .from("candidate-documents")
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast.error("Failed to upload resume");
      setResumeFile(null);
    } else {
      const { data: urlData } = supabase.storage
        .from("candidate-documents")
        .getPublicUrl(filePath);
      setResumeUrl(urlData.publicUrl);
      toast.success("Resume uploaded successfully");
    }
    setIsUploading(false);
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setCoverImageFile(file);

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/cover.${fileExt}`;

    const { error } = await supabase.storage
      .from("candidate-avatars")
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast.error("Failed to upload cover image");
      setCoverImageFile(null);
    } else {
      const { data: urlData } = supabase.storage
        .from("candidate-avatars")
        .getPublicUrl(filePath);
      setCoverImageUrl(urlData.publicUrl);
      toast.success("Cover image uploaded successfully");
    }
    setIsUploading(false);
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    if (skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        linkedin_url: data.linkedin_url || null,
        website_url: data.website_url || null,
        portfolio_url: data.portfolio_url || null,
        job_title: data.job_title,
        location: data.location,
        years_of_experience: data.years_of_experience,
        availability: data.availability,
        remote_preference: data.remote_preference,
        skills,
        resume_url: resumeUrl,
        cover_image_url: coverImageUrl,
        has_completed_extended_profile: true,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Extended profile saved!");
      await refreshProfile();
      navigate("/candidate-dashboard");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Extended Profile</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Complete Your Profile
            </h2>
            <p className="text-muted-foreground">
              Add more details to help employers find you and understand your expertise.
            </p>
          </div>

          {/* LinkedIn Import Section - Always visible */}
          <LinkedInImportSection
            userType="candidate"
            onImportSuccess={handleLinkedInImport}
            completionPercentage={profileCompletion.percentage}
            completionMessage={importCompletionMessage || undefined}
          />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Professional Links Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Professional Links
                </h3>

                <FormField
                  control={form.control}
                  name="linkedin_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn Profile
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourwebsite.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolio_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio (GitHub, Behance, Dribbble, etc.)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/yourusername" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* Professional Details Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Professional Details
                </h3>

                <FormField
                  control={form.control}
                  name="job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current / Desired Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="years_of_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {experienceOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Skills Input */}
                <div className="space-y-2">
                  <Label>Skills (up to 15)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill and press Enter"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={handleAddSkill}>
                      Add
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Work Preferences Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold">Work Preferences</h3>

                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="When can you start?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availabilityOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remote_preference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remote Preference</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select work preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {remoteOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* Optional Uploads Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Optional Uploads
                </h3>

                {/* Resume Upload */}
                <div className="space-y-2">
                  <Label>Resume / CV (PDF or Word, max 5MB)</Label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
                        <FileText className="w-4 h-4" />
                        <span>{resumeUrl ? "Replace Resume" : "Upload Resume"}</span>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleResumeUpload}
                        disabled={isUploading}
                      />
                    </label>
                    {(resumeFile || resumeUrl) && (
                      <span className="text-sm text-muted-foreground">
                        {resumeFile?.name || "Resume uploaded"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <Label>Cover Image (optional banner for your profile)</Label>
                  <div className="space-y-2">
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors w-fit">
                        <Upload className="w-4 h-4" />
                        <span>{coverImageUrl ? "Replace Image" : "Upload Image"}</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                    {coverImageUrl && (
                      <img
                        src={coverImageUrl}
                        alt="Cover preview"
                        className="w-full max-w-md h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>
              </section>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? "Saving..." : "Save Extended Profile"}
              </Button>
            </form>
          </Form>
        </motion.div>
      </main>
    </div>
  );
};

export default CandidateExtendedProfile;
