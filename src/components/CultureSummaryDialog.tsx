import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EMPLOYER_CULTURE_QUESTIONS } from "@/lib/gameData";
import { Check, Edit2 } from "lucide-react";

interface CultureSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  culturePreferences: Record<string, string> | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

const CultureSummaryDialog = ({
  open,
  onOpenChange,
  culturePreferences,
  onConfirm,
  isLoading,
}: CultureSummaryDialogProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const roleId = searchParams.get("role");
  const cityId = searchParams.get("city");
  if (!culturePreferences) return null;

  const getCultureSummaryItems = () => {
    return EMPLOYER_CULTURE_QUESTIONS.map((question) => {
      const answer = culturePreferences[question.id];
      // Options are strings in GameQuestion
      const selectedOption = question.options.find((opt) => opt === answer);
      return {
        question: question.question,
        answer: selectedOption || "Not specified",
      };
    }).filter((item) => item.answer !== "Not specified");
  };

  const summaryItems = getCultureSummaryItems();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Confirm Company Culture</DialogTitle>
          <DialogDescription>
            Review your company culture preferences before posting the job.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3 max-h-[400px] overflow-y-auto">
          {summaryItems.map((item, index) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-muted/50 rounded-lg p-3"
            >
              <p className="text-sm text-muted-foreground mb-1">{item.question}</p>
              <p className="font-medium text-foreground">{item.answer}</p>
            </motion.div>
          ))}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/culture-edit?role=${roleId}&city=${cityId}`)}
            disabled={isLoading}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Culture
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            <Check className="w-4 h-4 mr-2" />
            Confirm & Post Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CultureSummaryDialog;