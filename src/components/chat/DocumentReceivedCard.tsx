import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, ExternalLink, Check, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface DocumentReceivedCardProps {
  documentType: string;
  customLabel?: string | null;
  fileUrl: string | null;
  uploadedAt: string;
  candidateName?: string;
}

const documentTypeLabels: Record<string, string> = {
  resume: "Resume / CV",
  portfolio: "Portfolio",
  cover_letter: "Cover Letter",
  references: "References",
  other: "Document",
};

export function DocumentReceivedCard({
  documentType,
  customLabel,
  fileUrl,
  uploadedAt,
  candidateName = "Candidate",
}: DocumentReceivedCardProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const label = documentType === "other" && customLabel 
    ? customLabel 
    : documentTypeLabels[documentType] || "Document";

  const getFileExtension = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    return ext || 'file';
  };

  // Generate signed URL when needed
  useEffect(() => {
    const generateSignedUrl = async () => {
      if (!fileUrl) return;
      
      // Check if it's our path format
      if (fileUrl.startsWith("path::")) {
        setIsLoadingUrl(true);
        const filePath = fileUrl.replace("path::", "");
        try {
          const { data, error } = await supabase.storage
            .from("candidate-documents")
            .createSignedUrl(filePath, 3600); // 1 hour expiry
          
          if (error) {
            console.error("Error generating signed URL:", error);
            setSignedUrl(null);
          } else {
            setSignedUrl(data.signedUrl);
          }
        } catch (err) {
          console.error("Error:", err);
          setSignedUrl(null);
        } finally {
          setIsLoadingUrl(false);
        }
      } else {
        // Legacy: use URL as-is
        setSignedUrl(fileUrl);
      }
    };

    generateSignedUrl();
  }, [fileUrl]);

  const handleOpen = async () => {
    if (signedUrl) {
      window.open(signedUrl, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[85%] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl rounded-bl-md p-4"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Document Received
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {candidateName} uploaded their {label.toLowerCase()}
          </p>

          {fileUrl ? (
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-background border border-border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    .{getFileExtension(fileUrl)} • {formatDistanceToNow(new Date(uploadedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {isLoadingUrl ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={handleOpen}
                      disabled={!signedUrl}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    {signedUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        asChild
                      >
                        <a href={signedUrl} download>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Processing...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
