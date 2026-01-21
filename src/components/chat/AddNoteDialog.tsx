import { useState } from "react";
import { StickyNote, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInternalNotes } from "@/hooks/useInternalNotes";
import { cn } from "@/lib/utils";

interface AddNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  candidateName?: string;
}

export function AddNoteDialog({
  isOpen,
  onClose,
  matchId,
  candidateName,
}: AddNoteDialogProps) {
  const { notes, isLoading, isSaving, addNote, deleteNote } =
    useInternalNotes(matchId);
  const [newNote, setNewNote] = useState("");

  const handleSubmit = async () => {
    if (!newNote.trim()) return;
    const success = await addNote(newNote);
    if (success) {
      setNewNote("");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-primary" />
            Internal Notes
            {candidateName && (
              <span className="text-muted-foreground font-normal">
                for {candidateName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* New Note Input */}
          <div className="space-y-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a private note about this candidate..."
              rows={3}
            />
            <Button
              onClick={handleSubmit}
              disabled={!newNote.trim() || isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Note"
              )}
            </Button>
          </div>

          {/* Existing Notes */}
          {notes.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Previous Notes
              </h4>
              <ScrollArea className="max-h-[30vh]">
                <div className="space-y-3 pr-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className={cn(
                        "p-3 rounded-lg bg-secondary/50 border border-border",
                        "group relative"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap pr-8">
                        {note.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(note.created_at)}
                      </p>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {isLoading && notes.length === 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
