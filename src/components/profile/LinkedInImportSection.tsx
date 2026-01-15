import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { importLinkedInProfile, isValidLinkedInUrl, LinkedInProfileData } from "@/lib/linkedInImport";

interface LinkedInImportSectionProps {
  userType: "candidate" | "employer";
  onImportSuccess: (data: LinkedInProfileData) => void;
  completionPercentage?: number;
  completionMessage?: string;
}

type ImportState = "idle" | "loading" | "success" | "error";

const LinkedInImportSection = ({
  userType,
  onImportSuccess,
  completionPercentage,
  completionMessage,
}: LinkedInImportSectionProps) => {
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [importState, setImportState] = useState<ImportState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMockData, setIsMockData] = useState(false);

  const isValidUrl = linkedInUrl.trim() === "" || isValidLinkedInUrl(linkedInUrl);

  const handleImport = async () => {
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

    setImportState("loading");
    setErrorMessage("");

    const result = await importLinkedInProfile(linkedInUrl, userType);

    if (result.success && result.data) {
      setImportState("success");
      setIsMockData(result.isMock || false);
      onImportSuccess(result.data);
    } else {
      setImportState("error");
      setErrorMessage(result.error || "Failed to import profile");
    }
  };

  const handleReset = () => {
    setImportState("idle");
    setLinkedInUrl("");
    setErrorMessage("");
    setIsMockData(false);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-lg bg-[#0A66C2]/10">
            <Linkedin className="w-5 h-5 text-[#0A66C2]" />
          </div>
          <Sparkles className="w-4 h-4 text-amber-500" />
          Magic Import from LinkedIn
        </CardTitle>
        <CardDescription>
          Quickly fill your profile with data from LinkedIn
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
                onClick={handleImport}
                className="w-full gap-2"
                disabled={!linkedInUrl.trim()}
              >
                <Sparkles className="w-4 h-4" />
                Magic Import
              </Button>
            </motion.div>
          )}

          {importState === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center space-y-3"
            >
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <div>
                <p className="font-medium text-foreground">Importing your profile...</p>
                <p className="text-sm text-muted-foreground">This may take a few seconds</p>
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
                  {isMockData && (
                    <p className="text-sm text-muted-foreground">
                      (Using demo data - configure API key for real imports)
                    </p>
                  )}
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
