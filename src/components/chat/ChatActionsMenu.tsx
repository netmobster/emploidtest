import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  MessageSquare,
  FileText,
  Star,
  StickyNote,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface ChatActionsMenuProps {
  onScheduleInterview: () => void;
  onQuickQuestion: () => void;
  onRequestDocument: () => void;
  onAddToShortlist: () => void;
  onAddNote: () => void;
  onGetToKnow: () => void;
  hasCalendly?: boolean;
  isInShortlist?: boolean;
  jobId?: string;
}

const actions = [
  {
    id: "gettoknow",
    icon: Sparkles,
    label: "Get to Know Candidate",
    color: "bg-violet-500",
    employerOnly: true,
  },
  {
    id: "schedule",
    icon: Calendar,
    label: "Schedule Interview",
    color: "bg-blue-500",
    employerOnly: false,
  },
  {
    id: "question",
    icon: MessageSquare,
    label: "Quick Question",
    color: "bg-purple-500",
    employerOnly: true,
  },
  {
    id: "document",
    icon: FileText,
    label: "Request Document",
    color: "bg-amber-500",
    employerOnly: true,
  },
  {
    id: "shortlist",
    icon: Star,
    label: "Add to Shortlist",
    color: "bg-green-500",
    employerOnly: true,
  },
  {
    id: "note",
    icon: StickyNote,
    label: "Add Note",
    color: "bg-pink-500",
    employerOnly: true,
  },
];

export function ChatActionsMenu({
  onScheduleInterview,
  onQuickQuestion,
  onRequestDocument,
  onAddToShortlist,
  onAddNote,
  onGetToKnow,
  hasCalendly = false,
  isInShortlist = false,
  jobId,
}: ChatActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useAuth();

  const isEmployer = profile?.user_type === "employer";

  const handleAction = (actionId: string) => {
    setIsOpen(false);
    switch (actionId) {
      case "gettoknow":
        onGetToKnow();
        break;
      case "schedule":
        onScheduleInterview();
        break;
      case "question":
        onQuickQuestion();
        break;
      case "document":
        onRequestDocument();
        break;
      case "shortlist":
        onAddToShortlist();
        break;
      case "note":
        onAddNote();
        break;
    }
  };

  const visibleActions = actions.filter(
    (action) => !action.employerOnly || isEmployer
  );

  return (
    <div className="relative">
      {/* Floating Actions */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - use pointer-events to avoid blocking input */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              style={{ pointerEvents: 'auto' }}
            />

            {/* Action Items */}
            <div className="absolute bottom-14 right-0 z-50">
              {visibleActions.map((action, index) => {
                const isShortlistAction = action.id === "shortlist";
                const isDisabled = isShortlistAction && (!jobId || isInShortlist);
                const label =
                  isShortlistAction && isInShortlist
                    ? "Already in Shortlist"
                    : isShortlistAction && !jobId
                    ? "No Role Selected"
                    : action.label;

                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { delay: index * 0.05 },
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      scale: 0.8,
                      transition: { delay: (visibleActions.length - index) * 0.03 },
                    }}
                    className="flex items-center justify-end gap-2 mb-2"
                  >
                    <span className="text-sm font-medium text-foreground bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-border whitespace-nowrap">
                      {label}
                    </span>
                    <button
                      onClick={() => !isDisabled && handleAction(action.id)}
                      disabled={isDisabled}
                      className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110",
                        action.color,
                        isDisabled && "opacity-50 cursor-not-allowed hover:scale-100"
                      )}
                    >
                      <action.icon className="w-5 h-5 text-white" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-colors",
          isOpen ? "bg-muted" : "bg-primary"
        )}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-foreground" />
          ) : (
            <Plus className="w-5 h-5 text-primary-foreground" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
