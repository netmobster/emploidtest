import { motion } from "framer-motion";
import { FileText, Send } from "lucide-react";

interface DocumentRequestSentCardProps {
  documentType: string;
  customLabel?: string | null;
  sentAt: string;
}

const documentTypeLabels: Record<string, string> = {
  resume: "Resume / CV",
  portfolio: "Portfolio",
  cover_letter: "Cover Letter",
  references: "References",
  other: "Document",
};

export function DocumentRequestSentCard({
  documentType,
  customLabel,
}: DocumentRequestSentCardProps) {
  const label = documentType === "other" && customLabel 
    ? customLabel 
    : documentTypeLabels[documentType] || "Document";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[85%] ml-auto bg-primary/10 border border-primary/20 rounded-2xl rounded-br-md p-3"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-full bg-primary/20">
          <Send className="w-3 h-3 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">
            Requested: <span className="font-medium">{label}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Waiting for candidate to upload
          </p>
        </div>
        <FileText className="w-4 h-4 text-primary/60" />
      </div>
    </motion.div>
  );
}
