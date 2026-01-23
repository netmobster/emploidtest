import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoleDefinitionForm } from "./RoleDefinitionForm";

interface RoleDefinitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string | null;
  onComplete?: () => void;
}

export function RoleDefinitionDialog({ 
  open, 
  onOpenChange, 
  jobId,
  onComplete 
}: RoleDefinitionDialogProps) {
  if (!jobId) return null;

  const handleComplete = () => {
    onComplete?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Role Details</DialogTitle>
        </DialogHeader>
        <RoleDefinitionForm 
          jobId={jobId} 
          onComplete={handleComplete}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
