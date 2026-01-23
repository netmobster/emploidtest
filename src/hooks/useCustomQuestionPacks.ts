import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CustomQuestionPack {
  id: string;
  employer_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  questions: CustomPackQuestion[];
}

export interface CustomPackQuestion {
  id: string;
  pack_id: string;
  question_text: string;
  display_order: number;
  created_at: string;
}

export const useCustomQuestionPacks = () => {
  const { user } = useAuth();
  const [packs, setPacks] = useState<CustomQuestionPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPacks = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch packs
      const { data: packsData, error: packsError } = await supabase
        .from("custom_question_packs")
        .select("*")
        .eq("employer_id", user.id)
        .order("display_order", { ascending: true });

      if (packsError) throw packsError;

      // Fetch questions for all packs
      const packIds = packsData?.map((p) => p.id) || [];
      let questionsData: CustomPackQuestion[] = [];
      
      if (packIds.length > 0) {
        const { data: questions, error: questionsError } = await supabase
          .from("custom_pack_questions")
          .select("*")
          .in("pack_id", packIds)
          .order("display_order", { ascending: true });

        if (questionsError) throw questionsError;
        questionsData = questions || [];
      }

      // Merge questions into packs
      const packsWithQuestions = packsData?.map((pack) => ({
        ...pack,
        questions: questionsData.filter((q) => q.pack_id === pack.id),
      })) || [];

      setPacks(packsWithQuestions);
    } catch (error) {
      console.error("Error fetching custom packs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  const createPack = useCallback(
    async (title: string, description: string, questions: string[]) => {
      if (!user) return null;
      setIsSaving(true);

      try {
        // Create pack
        const { data: pack, error: packError } = await supabase
          .from("custom_question_packs")
          .insert({
            employer_id: user.id,
            title,
            description,
            display_order: packs.length,
          })
          .select()
          .single();

        if (packError) throw packError;

        // Add questions
        if (questions.length > 0) {
          const questionsToInsert = questions.map((q, i) => ({
            pack_id: pack.id,
            question_text: q,
            display_order: i,
          }));

          const { error: questionsError } = await supabase
            .from("custom_pack_questions")
            .insert(questionsToInsert);

          if (questionsError) throw questionsError;
        }

        await fetchPacks();
        toast.success("Question pack created!");
        return pack;
      } catch (error) {
        console.error("Error creating pack:", error);
        toast.error("Failed to create question pack");
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [user, packs.length, fetchPacks]
  );

  const updatePack = useCallback(
    async (
      packId: string,
      updates: { title?: string; description?: string; is_active?: boolean }
    ) => {
      setIsSaving(true);

      try {
        const { error } = await supabase
          .from("custom_question_packs")
          .update(updates)
          .eq("id", packId);

        if (error) throw error;
        await fetchPacks();
        toast.success("Pack updated!");
        return true;
      } catch (error) {
        console.error("Error updating pack:", error);
        toast.error("Failed to update pack");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [fetchPacks]
  );

  const deletePack = useCallback(
    async (packId: string) => {
      setIsSaving(true);

      try {
        const { error } = await supabase
          .from("custom_question_packs")
          .delete()
          .eq("id", packId);

        if (error) throw error;
        await fetchPacks();
        toast.success("Pack deleted!");
        return true;
      } catch (error) {
        console.error("Error deleting pack:", error);
        toast.error("Failed to delete pack");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [fetchPacks]
  );

  const addQuestion = useCallback(
    async (packId: string, questionText: string) => {
      setIsSaving(true);

      try {
        const pack = packs.find((p) => p.id === packId);
        const { error } = await supabase
          .from("custom_pack_questions")
          .insert({
            pack_id: packId,
            question_text: questionText,
            display_order: pack?.questions.length || 0,
          });

        if (error) throw error;
        await fetchPacks();
        return true;
      } catch (error) {
        console.error("Error adding question:", error);
        toast.error("Failed to add question");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [packs, fetchPacks]
  );

  const updateQuestion = useCallback(
    async (questionId: string, questionText: string) => {
      setIsSaving(true);

      try {
        const { error } = await supabase
          .from("custom_pack_questions")
          .update({ question_text: questionText })
          .eq("id", questionId);

        if (error) throw error;
        await fetchPacks();
        return true;
      } catch (error) {
        console.error("Error updating question:", error);
        toast.error("Failed to update question");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [fetchPacks]
  );

  const deleteQuestion = useCallback(
    async (questionId: string) => {
      setIsSaving(true);

      try {
        const { error } = await supabase
          .from("custom_pack_questions")
          .delete()
          .eq("id", questionId);

        if (error) throw error;
        await fetchPacks();
        return true;
      } catch (error) {
        console.error("Error deleting question:", error);
        toast.error("Failed to delete question");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [fetchPacks]
  );

  return {
    packs,
    activePacks: packs.filter((p) => p.is_active),
    isLoading,
    isSaving,
    createPack,
    updatePack,
    deletePack,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    refetch: fetchPacks,
  };
};
