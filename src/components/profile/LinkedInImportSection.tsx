import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Copy, Loader2, CheckCircle2, AlertCircle, ExternalLink, Plus, X, SkipForward, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { validateLinkedInUrl, isValidLinkedInUrl, createManualProfileData, LinkedInProfileData } from "@/lib/linkedInImport";

interface LinkedInImportSectionProps {
  userType: "candidate" | "employer";
  onImportSuccess: (data: LinkedInProfileData) => void;
  completionPercentage?: number;
  completionMessage?: string;
}

type ImportState = "idle" | "validating" | "manual-entry" | "success" | "error";

interface DraftData {
  linkedInUrl: string;
  fullName: string;
  headline: string;
  location: string;
  summary: string;
  companyName: string;
  skills: string[];
  yearsOfExperience: string;
  importState: ImportState;
  savedAt: number;
}

const DRAFT_STORAGE_KEY = "linkedin_import_draft";
const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const LinkedInImportSection = ({
  userType,
  onImportSuccess,
  completionPercentage,
  completionMessage,
}: LinkedInImportSectionProps) => {
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [importState, setImportState] = useState<ImportState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Manual entry form state
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState("");

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft: DraftData = JSON.parse(savedDraft);
        // Check if draft is still valid (not expired)
        if (Date.now() - draft.savedAt < DRAFT_EXPIRY_MS) {
          setLinkedInUrl(draft.linkedInUrl || "");
          setFullName(draft.fullName || "");
          setHeadline(draft.headline || "");
          setLocation(draft.location || "");
          setSummary(draft.summary || "");
          setCompanyName(draft.companyName || "");
          setSkills(draft.skills || []);
          setYearsOfExperience(draft.yearsOfExperience || "");
          // Only restore to manual-entry if there was meaningful data
          if (draft.importState === "manual-entry" && (draft.fullName || draft.headline || draft.skills.length > 0)) {
            setImportState("manual-entry");
          }
          setHasDraft(true);
          setLastSaved(new Date(draft.savedAt));
        } else {
          // Clear expired draft
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error("Failed to load draft:", e);
    }
  }, []);

  // Auto-save draft when form data changes
  const saveDraft = useCallback(() => {
    // Only save if there's something to save
    if (importState === "manual-entry" || fullName || headline || skills.length > 0 || summary) {
      const draft: DraftData = {
        linkedInUrl,
        fullName,
        headline,
        location,
        summary,
        companyName,
        skills,
        yearsOfExperience,
        importState: importState === "success" ? "idle" : importState,
        savedAt: Date.now(),
      };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        setLastSaved(new Date());
        setHasDraft(true);
      } catch (e) {
        console.error("Failed to save draft:", e);
      }
    }
  }, [linkedInUrl, fullName, headline, location, summary, companyName, skills, yearsOfExperience, importState]);

  // Debounced auto-save
  useEffect(() => {
    const timeoutId = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timeoutId);
  }, [saveDraft]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    setLastSaved(null);
  };

  const isValidUrl = linkedInUrl.trim() === "" || isValidLinkedInUrl(linkedInUrl);

  const handleValidateUrl = async () => {
    if (!linkedInUrl.trim()) {
      setErrorMessage("Please enter your LinkedIn profile URL to continue");
      setImportState("error");
      return;
    }

    if (!isValidLinkedInUrl(linkedInUrl)) {
      setErrorMessage("That doesn't look like a valid LinkedIn URL. Please use the format: linkedin.com/in/your-profile");
      setImportState("error");
      return;
    }

    setImportState("validating");
    setErrorMessage("");

    try {
      const result = await validateLinkedInUrl(linkedInUrl);

      if (result.success && result.requiresManualEntry) {
        setImportState("manual-entry");
      } else if (!result.success) {
        setImportState("error");
        setErrorMessage(result.error || "We couldn't validate your LinkedIn URL. Please try again or skip to enter manually.");
      }
    } catch (error) {
      setImportState("error");
      setErrorMessage("Something went wrong while validating your URL. Please try again or skip to enter manually.");
    }
  };

  const handleSkipToManualEntry = () => {
    setImportState("manual-entry");
    setErrorMessage("");
  };

  const parseAndAddSkills = (input: string) => {
    // Split by comma, semicolon, or newline and clean up
    const newSkills = input
      .split(/[,;\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !skills.includes(s));
    
    if (newSkills.length > 0) {
      setSkills([...skills, ...newSkills]);
      setSkillInput("");
    }
  };

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill) {
      // Check if input contains separators (comma, semicolon)
      if (trimmedSkill.includes(',') || trimmedSkill.includes(';')) {
        parseAndAddSkills(trimmedSkill);
      } else if (!skills.includes(trimmedSkill)) {
        setSkills([...skills, trimmedSkill]);
        setSkillInput("");
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSkillInputBlur = () => {
    // Auto-add skills when user clicks away
    if (skillInput.trim()) {
      handleAddSkill();
    }
  };

  const handleSubmitManualEntry = () => {
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name to continue");
      return;
    }

    const profileData = createManualProfileData({
      fullName: fullName.trim(),
      headline: headline.trim() || null,
      location: location.trim() || null,
      summary: summary.trim() || null,
      companyName: companyName.trim() || null,
      skills,
      yearsOfExperience: yearsOfExperience || null,
    });

    setImportState("success");
    clearDraft(); // Clear draft on successful submission
    onImportSuccess(profileData);
  };

  const handleReset = () => {
    setImportState("idle");
    setLinkedInUrl("");
    setErrorMessage("");
    setFullName("");
    setHeadline("");
    setLocation("");
    setSummary("");
    setCompanyName("");
    setSkillInput("");
    setSkills([]);
    setYearsOfExperience("");
    clearDraft(); // Clear draft on reset
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-[#0A66C2]/10">
                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
              </div>
              <Copy className="w-4 h-4 text-muted-foreground" />
              Import from LinkedIn
            </CardTitle>
            <CardDescription>
              Copy your LinkedIn info to quickly fill your profile
            </CardDescription>
          </div>
          {hasDraft && lastSaved && importState !== "success" && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Save className="w-3 h-3" />
              <span>Draft saved</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {importState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  className={!isValidUrl ? "border-destructive" : ""}
                />
                {!isValidUrl && (
                  <p className="text-sm text-destructive">
                    Please enter a valid LinkedIn URL (e.g., linkedin.com/in/your-profile)
                  </p>
                )}
              </div>
              <Button
                onClick={handleValidateUrl}
                className="w-full gap-2"
                disabled={!linkedInUrl.trim()}
              >
                <Copy className="w-4 h-4" />
                Start Import
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                onClick={handleSkipToManualEntry}
                className="w-full gap-2 text-muted-foreground hover:text-foreground"
              >
                <SkipForward className="w-4 h-4" />
                Skip and enter manually
              </Button>
            </motion.div>
          )}

          {importState === "validating" && (
            <motion.div
              key="validating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center space-y-4"
            >
              <div className="relative">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Validating your LinkedIn URL...</p>
                <p className="text-sm text-muted-foreground">This will only take a moment</p>
              </div>
            </motion.div>
          )}

          {importState === "manual-entry" && (
            <motion.div
              key="manual-entry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {linkedInUrl && (
                <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <a 
                      href={linkedInUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:no-underline font-medium"
                    >
                      Open your LinkedIn profile
                    </a>
                    {" "}and copy the information below.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="e.g., John Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headline">Headline / Title</Label>
                  <Input
                    id="headline"
                    placeholder="e.g., Senior Software Engineer at Google"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                </div>

                {userType === "employer" && (
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g., Acme Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Select value={yearsOfExperience} onValueChange={setYearsOfExperience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5-10">5-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">About / Summary</Label>
                  <Textarea
                    id="summary"
                    placeholder="Copy your 'About' section from LinkedIn..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <p className="text-xs text-muted-foreground">
                    Add one at a time or paste multiple skills separated by commas
                  </p>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      placeholder="e.g., React, TypeScript, Node.js"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSkillInputBlur}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={handleAddSkill}>
                      <Plus className="w-4 h-4" />
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

                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={handleReset} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitManualEntry} className="flex-1">
                    Import Profile
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {importState === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <p className="font-medium">Profile data imported successfully!</p>
                  <p className="text-sm text-muted-foreground">Your information has been added to the form below</p>
                </div>
              </div>
              
              {completionMessage && (
                <Alert className="bg-primary/5 border-primary/20">
                  <AlertDescription className="text-foreground">
                    {completionMessage}
                  </AlertDescription>
                </Alert>
              )}

              <Button variant="outline" onClick={handleReset} className="w-full">
                Import Again
              </Button>
            </motion.div>
          )}

          {importState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Try Again
                </Button>
                <Button variant="secondary" onClick={handleSkipToManualEntry} className="flex-1 gap-2">
                  <SkipForward className="w-4 h-4" />
                  Enter Manually
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default LinkedInImportSection;
