import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface QuickQuestionTemplate {
  id: string;
  employer_id: string | null;
  question_text: string;
  is_default: boolean;
  display_order: number;
  created_at: string;
}

// Default questions for all employers
const DEFAULT_QUESTIONS = [
  "What's your availability for an interview this week?",
  "What's your expected salary range?",
  "When could you start if offered the position?",
  "Do you have any questions about the role?",
  "What interests you most about this opportunity?",
];

export const useQuickQuestions = () => {
  const { user, profile } = useAuth();
  const [templates, setTemplates] = useState<QuickQuestionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch templates
  useEffect(() => {
    if (!user) return;

    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("quick_question_templates")
          .select("*")
          .or(`is_default.eq.true,employer_id.eq.${user.id}`)
          .order("is_default", { ascending: false })
          .order("display_order", { ascending: true });

        if (error) throw error;

        // If no templates exist, create defaults for this employer
        if (!data || data.length === 0) {
          const defaultTemplates = DEFAULT_QUESTIONS.map((q, i) => ({
            employer_id: null,
            question_text: q,
            is_default: true,
            display_order: i,
          }));

          // Just use the defaults in memory
          setTemplates(
            defaultTemplates.map((t, i) => ({
              ...t,
              id: `default-${i}`,
              employer_id: null,
              created_at: new Date().toISOString(),
            })) as QuickQuestionTemplate[]
          );
        } else {
          setTemplates(data);
        }
      } catch (error) {
        console.error("Error fetching quick questions:", error);
        // Fall back to defaults
        setTemplates(
          DEFAULT_QUESTIONS.map((q, i) => ({
            id: `default-${i}`,
            employer_id: null,
            question_text: q,
            is_default: true,
            display_order: i,
            created_at: new Date().toISOString(),
          }))
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [user]);

  const addTemplate = useCallback(
    async (questionText: string) => {
      if (!user || !questionText.trim()) return false;

      setIsSaving(true);
      try {
        const { data, error } = await supabase
          .from("quick_question_templates")
          .insert({
            employer_id: user.id,
            question_text: questionText.trim(),
            is_default: false,
            display_order: templates.length,
          })
          .select()
          .single();

        if (error) throw error;

        setTemplates((prev) => [...prev, data]);
        toast.success("Question template added");
        return true;
      } catch (error) {
        console.error("Error adding template:", error);
        toast.error("Failed to add template");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [user, templates.length]
  );

  const updateTemplate = useCallback(
    async (templateId: string, questionText: string) => {
      if (!user || !questionText.trim()) return false;

      setIsSaving(true);
      try {
        const { error } = await supabase
          .from("quick_question_templates")
          .update({ question_text: questionText.trim() })
          .eq("id", templateId)
          .eq("employer_id", user.id);

        if (error) throw error;

        setTemplates((prev) =>
          prev.map((t) =>
            t.id === templateId ? { ...t, question_text: questionText.trim() } : t
          )
        );
        toast.success("Template updated");
        return true;
      } catch (error) {
        console.error("Error updating template:", error);
        toast.error("Failed to update template");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [user]
  );

  const deleteTemplate = useCallback(
    async (templateId: string) => {
      if (!user) return false;

      // Don't allow deleting default templates
      const template = templates.find((t) => t.id === templateId);
      if (template?.is_default) {
        toast.error("Cannot delete default templates");
        return false;
      }

      setIsSaving(true);
      try {
        const { error } = await supabase
          .from("quick_question_templates")
          .delete()
          .eq("id", templateId)
          .eq("employer_id", user.id);

        if (error) throw error;

        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
        toast.success("Template deleted");
        return true;
      } catch (error) {
        console.error("Error deleting template:", error);
        toast.error("Failed to delete template");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [user, templates]
  );

  return {
    templates,
    isLoading,
    isSaving,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    // Helper to get all questions (defaults + custom)
    allQuestions: templates.map((t) => t.question_text),
  };
};
