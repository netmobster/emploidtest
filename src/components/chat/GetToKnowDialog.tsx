import { useState, useEffect } from "react";
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
import { Send, Sparkles, MessageCircle, Package, Loader2 } from "lucide-react";
import { questionPacks, quickFireQuestions, getCategoryColor } from "@/data/quickFireQuestions";
import { useCustomQuestionPacks } from "@/hooks/useCustomQuestionPacks";
import { cn } from "@/lib/utils";

interface GetToKnowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSendQuiz: (
    questions: { id: string; question: string; category: string }[],
    packInfo?: { packId: string; isCustom: boolean }
  ) => void;
  candidateName?: string;
}

interface SelectableQuestion {
  id: string;
  question: string;
  category: string;
  categoryLabel: string;
  isCustom: boolean;
  packId: string;
}

export function GetToKnowDialog({
  isOpen,
  onClose,
  onSendQuiz,
  candidateName = "the candidate",
}: GetToKnowDialogProps) {
  const { activePacks: customPacks, isLoading: loadingCustom } = useCustomQuestionPacks();
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

  // Build combined question list
  const allQuestions: SelectableQuestion[] = [
    // Default questions
    ...quickFireQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      category: q.category,
      categoryLabel: q.categoryLabel,
      isCustom: false,
      packId: q.category,
    })),
    // Custom questions
    ...customPacks.flatMap((pack) =>
      pack.questions.map((q, index) => ({
        id: `custom-${pack.id}-${q.id}`,
        question: q.question_text,
        category: pack.id,
        categoryLabel: pack.title,
        isCustom: true,
        packId: pack.id,
      }))
    ),
  ];

  // Group by pack for display
  const defaultPacksWithQuestions = questionPacks.map((pack) => ({
    ...pack,
    isCustom: false,
    questions: allQuestions.filter((q) => !q.isCustom && q.packId === pack.id),
  }));

  const customPacksWithQuestions = customPacks.map((pack) => ({
    id: pack.id,
    title: pack.title,
    description: pack.description || "",
    isCustom: true,
    questions: allQuestions.filter((q) => q.isCustom && q.packId === pack.id),
  }));

  const allPacks = [...defaultPacksWithQuestions, ...customPacksWithQuestions];

  // Track which pack the selected questions belong to
  useEffect(() => {
    if (selectedQuestions.length > 0) {
      const firstQuestion = allQuestions.find((q) => q.id === selectedQuestions[0]);
      if (firstQuestion) {
        setSelectedPackId(firstQuestion.packId);
      }
    } else {
      setSelectedPackId(null);
    }
  }, [selectedQuestions]);

  const toggleQuestion = (id: string) => {
    const question = allQuestions.find((q) => q.id === id);
    if (!question) return;

    setSelectedQuestions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((q) => q !== id);
      }
      if (prev.length >= 5) {
        return prev;
      }
      // If selecting from a different pack, clear previous selections
      if (selectedPackId && question.packId !== selectedPackId) {
        return [id];
      }
      return [...prev, id];
    });
  };

  const handleSend = () => {
    const questions = allQuestions
      .filter((q) => selectedQuestions.includes(q.id))
      .map((q) => ({
        id: q.id,
        question: q.question,
        category: q.category,
      }));

    const firstQuestion = allQuestions.find((q) => q.id === selectedQuestions[0]);
    const packInfo = firstQuestion
      ? { packId: firstQuestion.packId, isCustom: firstQuestion.isCustom }
      : undefined;

    onSendQuiz(questions, packInfo);
    setSelectedQuestions([]);
    setSelectedPackId(null);
    onClose();
  };

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

        {loadingCustom ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {allPacks.map((pack) => {
                const isPackSelected = selectedPackId === pack.id;
                const isDifferentPackSelected = selectedPackId && selectedPackId !== pack.id;

                return (
                  <div
                    key={pack.id}
                    className={cn(
                      "transition-opacity",
                      isDifferentPackSelected && "opacity-50"
                    )}
                  >
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {pack.isCustom ? (
                          <Package className="w-4 h-4 text-primary" />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-primary" />
                        )}
                        {pack.title}
                        {pack.isCustom && (
                          <Badge variant="outline" className="text-[10px] ml-1">
                            Custom
                          </Badge>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {pack.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {pack.questions.map((q) => {
                        const isSelected = selectedQuestions.includes(q.id);
                        const isDisabled =
                          (!isSelected && selectedQuestions.length >= 5) ||
                          (isDifferentPackSelected && !isSelected);

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
                                className={cn(
                                  "mt-2 text-[10px]",
                                  q.isCustom
                                    ? "bg-primary/10 text-primary border-primary/30"
                                    : getCategoryColor(q.category)
                                )}
                              >
                                {q.categoryLabel}
                              </Badge>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

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
