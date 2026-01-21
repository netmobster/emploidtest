import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentType, useDocumentRequests } from "@/hooks/useDocumentRequests";

interface RequestDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  candidateName?: string;
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: "resume", label: "Resume / CV" },
  { value: "portfolio", label: "Portfolio" },
  { value: "cover_letter", label: "Cover Letter" },
  { value: "references", label: "References" },
  { value: "other", label: "Other" },
];

export function RequestDocumentDialog({
  isOpen,
  onClose,
  matchId,
  candidateName,
}: RequestDocumentDialogProps) {
  const { requestDocument, isSaving } = useDocumentRequests(matchId);
  const [documentType, setDocumentType] = useState<DocumentType>("resume");
  const [customLabel, setCustomLabel] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    const success = await requestDocument(
      documentType,
      documentType === "other" ? customLabel : undefined,
      notes || undefined
    );
    if (success) {
      setDocumentType("resume");
      setCustomLabel("");
      setNotes("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Request Document
            {candidateName && (
              <span className="text-muted-foreground font-normal">
                from {candidateName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select
              value={documentType}
              onValueChange={(v) => setDocumentType(v as DocumentType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {documentType === "other" && (
            <div className="space-y-2">
              <Label>Custom Label</Label>
              <Input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g., Writing Sample, Certifications"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific instructions or details..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSaving || (documentType === "other" && !customLabel.trim())
            }
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
