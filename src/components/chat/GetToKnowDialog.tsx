import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, MessageCircle } from "lucide-react";
import { questionPacks, quickFireQuestions, getCategoryColor } from "@/data/quickFireQuestions";
import { cn } from "@/lib/utils";

interface GetToKnowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSendQuiz: (questions: { id: string; question: string; category: string }[]) => void;
  candidateName?: string;
}

export function GetToKnowDialog({
  isOpen,
  onClose,
  onSendQuiz,
  candidateName = "the candidate",
}: GetToKnowDialogProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((q) => q !== id);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSend = () => {
    const questions = quickFireQuestions
      .filter((q) => selectedQuestions.includes(q.id))
      .map((q) => ({
        id: q.id,
        question: q.question,
        category: q.category,
      }));
    onSendQuiz(questions);
    setSelectedQuestions([]);
    onClose();
  };

  // Group questions by pack
  const groupedByPack = questionPacks.map((pack) => ({
    ...pack,
    questions: quickFireQuestions.filter((q) => q.category === pack.id),
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Get to Know {candidateName}
          </DialogTitle>
          <DialogDescription>
            Select 3-5 quick-fire questions to send as a fun, 2-minute quiz.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">Selected</span>
          <Badge
            variant={selectedQuestions.length >= 3 ? "default" : "secondary"}
          >
            {selectedQuestions.length} / 5
          </Badge>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {groupedByPack.map((pack) => (
              <div key={pack.id}>
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    {pack.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pack.description}
                  </p>
                </div>
                <div className="space-y-2">
                  {pack.questions.map((q) => {
                    const isSelected = selectedQuestions.includes(q.id);
                    const isDisabled = !isSelected && selectedQuestions.length >= 5;
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => !isDisabled && toggleQuestion(q.id)}
                        disabled={isDisabled}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          className="mt-0.5"
                          disabled={isDisabled}
                        />
                        <div className="flex-1">
                          <p className="text-sm">{q.question}</p>
                          <Badge
                            variant="outline"
                            className={cn("mt-2 text-[10px]", getCategoryColor(q.category))}
                          >
                            {q.categoryLabel}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedQuestions.length < 3}
            className="flex-1 gap-2"
          >
            <Send className="w-4 h-4" />
            Send Quiz ({selectedQuestions.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}