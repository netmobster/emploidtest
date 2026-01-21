import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, X, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentRequests, RequestStatus } from "@/hooks/useDocumentRequests";
import { cn } from "@/lib/utils";

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
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Filter to show only pending requests that the current user needs to fulfill
  // (requests made by others, not by the current user)
  const pendingRequests = requests.filter(
    (req) => req.status === "pending" && req.requester_id !== currentUserId
  );

  if (pendingRequests.length === 0) return null;

  const handleFileSelect = async (requestId: string, file: File) => {
    setUploadingId(requestId);
    await uploadDocument(requestId, file);
    setUploadingId(null);
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

                    <Button
                      size="sm"
                      onClick={() => fileInputRefs.current[request.id]?.click()}
                      disabled={isSaving || uploadingId === request.id}
                    >
                      {uploadingId === request.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-1" />
                          Upload
                        </>
                      )}
                    </Button>
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
