import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Trash2,
  Loader2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuickQuestions } from "@/hooks/useQuickQuestions";
import { cn } from "@/lib/utils";

export function QuickQuestionsSettings() {
  const { templates, isLoading, isSaving, addTemplate, updateTemplate, deleteTemplate } =
    useQuickQuestions();
  const [newQuestion, setNewQuestion] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = async () => {
    if (!newQuestion.trim()) return;
    const success = await addTemplate(newQuestion);
    if (success) setNewQuestion("");
  };

  const handleStartEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditValue(text);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editValue.trim()) return;
    const success = await updateTemplate(id, editValue);
    if (success) {
      setEditingId(null);
      setEditValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const defaultTemplates = templates.filter((t) => t.is_default);
  const customTemplates = templates.filter((t) => !t.is_default);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Quick Question Templates
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Save common questions to quickly send to candidates during chats
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Question */}
        <div className="flex gap-2">
          <Input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Add a new question template..."
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={!newQuestion.trim() || isSaving}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Custom Templates */}
        {customTemplates.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Your Templates</h4>
            {customTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border border-border",
                  "bg-secondary/30"
                )}
              >
                {editingId === template.id ? (
                  <>
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleSaveEdit(template.id)}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{template.question_text}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleStartEdit(template.id, template.question_text)}
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Default Templates */}
        {defaultTemplates.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-sm font-medium text-muted-foreground">
              Default Templates (cannot be edited)
            </h4>
            {defaultTemplates.map((template) => (
              <div
                key={template.id}
                className="p-3 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground"
              >
                {template.question_text}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
