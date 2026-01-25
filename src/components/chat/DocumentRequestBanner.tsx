import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, X, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDocumentRequests, RequestStatus } from "@/hooks/useDocumentRequests";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentRequestBannerProps {
  matchId: string;
  currentUserId: string;
}

const documentTypeLabels: Record<string, string> = {
  resume: "Resume / CV",
  portfolio: "Portfolio",
  cover_letter: "Cover Letter",
  references: "References",
  other: "Document",
};

export function DocumentRequestBanner({
  matchId,
  currentUserId,
}: DocumentRequestBannerProps) {
  const { requests, uploadDocument, isSaving } = useDocumentRequests(matchId);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Filter to show only pending requests that the current user needs to fulfill
  // (requests made by others, not by the current user)
  const pendingRequests = requests.filter(
    (req) => req.status === "pending" && req.requester_id !== currentUserId
  );

  if (pendingRequests.length === 0) return null;

  const handleFileSelect = async (requestId: string, file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      toast.error("File too large. Max size is 10MB.");
      return;
    }

    setUploadingId(requestId);
    setUploadProgress(0);
    setUploadError(null);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    const success = await uploadDocument(requestId, file);
    
    clearInterval(progressInterval);
    
    if (success) {
      setUploadProgress(100);
      toast.success("Document uploaded successfully!");
      setTimeout(() => {
        setUploadingId(null);
        setUploadProgress(0);
      }, 500);
    } else {
      setUploadError("Upload failed. Please try again.");
      setUploadingId(null);
      setUploadProgress(0);
    }
  };

  const getLabel = (request: typeof pendingRequests[0]) => {
    if (request.document_type === "other" && request.custom_label) {
      return request.custom_label;
    }
    return documentTypeLabels[request.document_type] || "Document";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="border-b border-border bg-amber-50 dark:bg-amber-950/30"
      >
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Document Request{pendingRequests.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                The employer has requested the following document
                {pendingRequests.length > 1 ? "s" : ""}:
              </p>

              <div className="space-y-2">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className={cn(
                      "flex items-center justify-between gap-3 p-3 rounded-lg",
                      "bg-background border border-border"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {getLabel(request)}
                      </p>
                      {request.notes && (
                        <p className="text-xs text-muted-foreground truncate">
                          {request.notes}
                        </p>
                      )}
                    </div>

                    <input
                      type="file"
                      ref={(el) => (fileInputRefs.current[request.id] = el)}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(request.id, file);
                      }}
                    />

                    <div className="flex flex-col items-end gap-1">
                      {uploadingId === request.id && uploadProgress > 0 && (
                        <div className="w-20">
                          <Progress value={uploadProgress} className="h-1" />
                        </div>
                      )}
                      <Button
                        size="sm"
                        onClick={() => fileInputRefs.current[request.id]?.click()}
                        disabled={isSaving || uploadingId === request.id}
                      >
                        {uploadingId === request.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-1" />
                            Upload
                          </>
                        )}
                      </Button>
                      {uploadError && uploadingId !== request.id && (
                        <p className="text-xs text-destructive">{uploadError}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
