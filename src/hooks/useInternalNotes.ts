import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface InternalNote {
  id: string;
  match_id: string;
  employer_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useInternalNotes = (matchId: string) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch notes for match
  useEffect(() => {
    if (!matchId || !user) return;

    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("internal_notes")
          .select("*")
          .eq("match_id", matchId)
          .eq("employer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotes(data || []);
      } catch (error) {
        console.error("Error fetching internal notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [matchId, user]);

  const addNote = useCallback(
    async (content: string) => {
      if (!user || !matchId || !content.trim()) return false;

      setIsSaving(true);
      try {
        const { data, error } = await supabase
          .from("internal_notes")
          .insert({
            match_id: matchId,
            employer_id: user.id,
            content: content.trim(),
          })
          .select()
          .single();

        if (error) throw error;

        setNotes((prev) => [data, ...prev]);
        toast.success("Note added");
        return true;
      } catch (error) {
        console.error("Error adding note:", error);
        toast.error("Failed to add note");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [user, matchId]
  );

  const updateNote = useCallback(
    async (noteId: string, content: string) => {
      if (!user || !content.trim()) return false;

      setIsSaving(true);
      try {
        const { error } = await supabase
          .from("internal_notes")
          .update({ content: content.trim() })
          .eq("id", noteId)
          .eq("employer_id", user.id);

        if (error) throw error;

        setNotes((prev) =>
          prev.map((note) =>
            note.id === noteId ? { ...note, content: content.trim() } : note
          )
        );
        toast.success("Note updated");
        return true;
      } catch (error) {
        console.error("Error updating note:", error);
        toast.error("Failed to update note");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [user]
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("internal_notes")
          .delete()
          .eq("id", noteId)
          .eq("employer_id", user.id);

        if (error) throw error;

        setNotes((prev) => prev.filter((note) => note.id !== noteId));
        toast.success("Note deleted");
        return true;
      } catch (error) {
        console.error("Error deleting note:", error);
        toast.error("Failed to delete note");
        return false;
      }
    },
    [user]
  );

  return {
    notes,
    isLoading,
    isSaving,
    addNote,
    updateNote,
    deleteNote,
  };
};
