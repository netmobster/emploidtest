import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCustomQuestionPacks, CustomQuestionPack } from "@/hooks/useCustomQuestionPacks";
import { cn } from "@/lib/utils";

export function CustomQuestionPacksSettings() {
  const {
    packs,
    isLoading,
    isSaving,
    createPack,
    updatePack,
    deletePack,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  } = useCustomQuestionPacks();

  const [isCreating, setIsCreating] = useState(false);
  const [newPackTitle, setNewPackTitle] = useState("");
  const [newPackDescription, setNewPackDescription] = useState("");
  const [newPackQuestions, setNewPackQuestions] = useState<string[]>([""]);
  const [expandedPackId, setExpandedPackId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState("");
  const [addingToPackId, setAddingToPackId] = useState<string | null>(null);
  const [newQuestionText, setNewQuestionText] = useState("");

  const handleCreatePack = async () => {
    const validQuestions = newPackQuestions.filter((q) => q.trim());
    if (!newPackTitle.trim() || validQuestions.length === 0) return;

    const result = await createPack(newPackTitle, newPackDescription, validQuestions);
    if (result) {
      setIsCreating(false);
      setNewPackTitle("");
      setNewPackDescription("");
      setNewPackQuestions([""]);
    }
  };

  const handleAddQuestionField = () => {
    setNewPackQuestions([...newPackQuestions, ""]);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...newPackQuestions];
    updated[index] = value;
    setNewPackQuestions(updated);
  };

  const handleRemoveQuestionField = (index: number) => {
    if (newPackQuestions.length > 1) {
      setNewPackQuestions(newPackQuestions.filter((_, i) => i !== index));
    }
  };

  const handleToggleActive = async (pack: CustomQuestionPack) => {
    await updatePack(pack.id, { is_active: !pack.is_active });
  };

  const handleSaveQuestion = async (questionId: string) => {
    if (!editingQuestionText.trim()) return;
    await updateQuestion(questionId, editingQuestionText);
    setEditingQuestionId(null);
    setEditingQuestionText("");
  };

  const handleAddNewQuestion = async (packId: string) => {
    if (!newQuestionText.trim()) return;
    await addQuestion(packId, newQuestionText);
    setAddingToPackId(null);
    setNewQuestionText("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Custom Question Packs
        </CardTitle>
        <CardDescription>
          Create your own question packs to use when getting to know candidates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create New Pack */}
        <AnimatePresence>
          {isCreating ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-border rounded-lg p-4 space-y-4 bg-muted/30"
            >
              <div className="space-y-3">
                <Input
                  placeholder="Pack title (e.g., 'Team Fit Questions')"
                  value={newPackTitle}
                  onChange={(e) => setNewPackTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newPackDescription}
                  onChange={(e) => setNewPackDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Questions</p>
                {newPackQuestions.map((q, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Question ${index + 1}`}
                      value={q}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                    />
                    {newPackQuestions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestionField(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddQuestionField}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Question
                </Button>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewPackTitle("");
                    setNewPackDescription("");
                    setNewPackQuestions([""]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePack}
                  disabled={
                    !newPackTitle.trim() ||
                    newPackQuestions.filter((q) => q.trim()).length === 0 ||
                    isSaving
                  }
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Pack"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Question Pack
            </Button>
          )}
        </AnimatePresence>

        {/* Existing Packs */}
        <div className="space-y-3">
          {packs.length === 0 && !isCreating ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No custom question packs yet. Create one to get started!
            </p>
          ) : (
            packs.map((pack) => (
              <motion.div
                key={pack.id}
                layout
                className={cn(
                  "border rounded-lg overflow-hidden transition-colors",
                  pack.is_active ? "border-border" : "border-border/50 bg-muted/30"
                )}
              >
                {/* Pack Header */}
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    setExpandedPackId(expandedPackId === pack.id ? null : pack.id)
                  }
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(pack);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {pack.is_active ? (
                        <ToggleRight className="w-5 h-5 text-primary" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <p
                        className={cn(
                          "font-medium text-sm",
                          !pack.is_active && "text-muted-foreground"
                        )}
                      >
                        {pack.title}
                      </p>
                      {pack.description && (
                        <p className="text-xs text-muted-foreground">{pack.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {pack.questions.length} questions
                    </Badge>
                    {expandedPackId === pack.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Pack Questions */}
                <AnimatePresence>
                  {expandedPackId === pack.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-2 border-t pt-3">
                        {pack.questions.map((question) => (
                          <div
                            key={question.id}
                            className="flex items-start gap-2 p-2 rounded bg-muted/50 group"
                          >
                            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            {editingQuestionId === question.id ? (
                              <div className="flex-1 flex gap-2">
                                <Input
                                  value={editingQuestionText}
                                  onChange={(e) => setEditingQuestionText(e.target.value)}
                                  className="h-8 text-sm"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => handleSaveQuestion(question.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingQuestionId(null);
                                    setEditingQuestionText("");
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="flex-1 text-sm">{question.question_text}</span>
                                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setEditingQuestionId(question.id);
                                      setEditingQuestionText(question.question_text);
                                    }}
                                    className="p-1 hover:bg-background rounded"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                                  </button>
                                  <button
                                    onClick={() => deleteQuestion(question.id)}
                                    className="p-1 hover:bg-background rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}

                        {/* Add Question */}
                        {addingToPackId === pack.id ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="New question..."
                              value={newQuestionText}
                              onChange={(e) => setNewQuestionText(e.target.value)}
                              className="h-8 text-sm"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleAddNewQuestion(pack.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => {
                                setAddingToPackId(null);
                                setNewQuestionText("");
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => setAddingToPackId(pack.id)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Question
                          </Button>
                        )}

                        <Separator />

                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deletePack(pack.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete Pack
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
