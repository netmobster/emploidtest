import { useState } from "react";
import { MessageSquare, Plus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuickQuestions } from "@/hooks/useQuickQuestions";
import { cn } from "@/lib/utils";

interface QuickQuestionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (question: string) => void;
}

export function QuickQuestionsDialog({
  isOpen,
  onClose,
  onSelectQuestion,
}: QuickQuestionsDialogProps) {
  const { templates, isLoading, isSaving, addTemplate, deleteTemplate } =
    useQuickQuestions();
  const [newQuestion, setNewQuestion] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSelect = (question: string) => {
    onSelectQuestion(question);
    onClose();
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;
    const success = await addTemplate(newQuestion);
    if (success) {
      setNewQuestion("");
      setShowAddForm(false);
    }
  };

  const handleDelete = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteTemplate(templateId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Quick Questions
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-2 pr-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelect(template.question_text)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border border-border",
                      "hover:bg-secondary/50 transition-colors",
                      "flex items-start justify-between gap-2 group"
                    )}
                  >
                    <span className="text-sm">{template.question_text}</span>
                    {!template.is_default && (
                      <button
                        onClick={(e) => handleDelete(template.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>

            {/* Add New Question */}
            <div className="border-t pt-4 mt-2">
              {showAddForm ? (
                <div className="space-y-2">
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Type your question template..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddQuestion();
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewQuestion("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddQuestion}
                      disabled={!newQuestion.trim() || isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Question
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
