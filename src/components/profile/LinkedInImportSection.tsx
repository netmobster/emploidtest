import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Copy, Loader2, CheckCircle2, AlertCircle, ExternalLink, Plus, X } from "lucide-react";
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

const LinkedInImportSection = ({
  userType,
  onImportSuccess,
  completionPercentage,
  completionMessage,
}: LinkedInImportSectionProps) => {
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [importState, setImportState] = useState<ImportState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Manual entry form state
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState("");

  const isValidUrl = linkedInUrl.trim() === "" || isValidLinkedInUrl(linkedInUrl);

  const handleValidateUrl = async () => {
    if (!linkedInUrl.trim()) {
      setErrorMessage("Please enter a LinkedIn URL");
      setImportState("error");
      return;
    }

    if (!isValidLinkedInUrl(linkedInUrl)) {
      setErrorMessage("Invalid LinkedIn URL. Please use format: https://linkedin.com/in/yourprofile");
      setImportState("error");
      return;
    }

    setImportState("validating");
    setErrorMessage("");

    const result = await validateLinkedInUrl(linkedInUrl);

    if (result.success && result.requiresManualEntry) {
      setImportState("manual-entry");
    } else if (!result.success) {
      setImportState("error");
      setErrorMessage(result.error || "Failed to validate URL");
    }
  };

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput("");
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

  const handleSubmitManualEntry = () => {
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name");
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
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
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
                    Please enter a valid LinkedIn URL
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
            </motion.div>
          )}

          {importState === "validating" && (
            <motion.div
              key="validating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center space-y-3"
            >
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <div>
                <p className="font-medium text-foreground">Validating URL...</p>
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
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      placeholder="Type a skill and press Enter"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleKeyDown}
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
                  <p className="text-sm text-destructive">{errorMessage}</p>
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
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-6 h-6" />
                <p className="font-medium">{errorMessage}</p>
              </div>
              <Button variant="outline" onClick={handleReset} className="w-full">
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default LinkedInImportSection;
