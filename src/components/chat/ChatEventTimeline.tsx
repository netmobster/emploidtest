import { motion } from "framer-motion";
import { FileText, Upload } from "lucide-react";
import { QuizEventCard } from "./QuizEventCard";
import { DocumentRequestSentCard } from "./DocumentRequestSentCard";
import { InterviewEventCard } from "./InterviewEventCard";
import { useDocumentRequests } from "@/hooks/useDocumentRequests";
import { useInterviews } from "@/hooks/useInterviews";

const documentTypeLabels: Record<string, string> = {
  resume: "Resume / CV",
  portfolio: "Portfolio",
  cover_letter: "Cover Letter",
  references: "References",
  other: "Document",
};

function DocumentReceivedTimelineCard({ documentType, customLabel }: { documentType: string; customLabel?: string | null }) {
  const label = documentType === "other" && customLabel ? customLabel : documentTypeLabels[documentType] || "Document";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[85%] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl rounded-bl-md p-3"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50">
          <Upload className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">
            Requested: <span className="font-medium">{label}</span>
          </p>
          <p className="text-xs text-muted-foreground">Upload via the banner above</p>
        </div>
        <FileText className="w-4 h-4 text-amber-500/60" />
      </div>
    </motion.div>
  );
}

interface QuizRequest {
  id: string;
  status: "pending" | "completed";
  created_at: string;
  employer_id: string;
  employer_name: string;
  questions: { id: string; question: string; category: string }[];
}

interface ChatEventTimelineProps {
  matchId: string;
  currentUserId?: string;
  isEmployer: boolean;
  quizRequests: QuizRequest[];
  candidateName?: string;
  employerName?: string;
}

export function ChatEventTimeline({
  matchId,
  currentUserId,
  isEmployer,
  quizRequests,
  candidateName = "Candidate",
  employerName = "Employer",
}: ChatEventTimelineProps) {
  const { requests: documentRequests } = useDocumentRequests(matchId);
  const { interviews } = useInterviews(matchId);

  // Build a timeline of all events sorted by date
  const events: {
    type: "quiz_sent" | "quiz_completed" | "quiz_received" | "document_requested" | "document_received" | "interview";
    timestamp: string;
    data: any;
  }[] = [];

  // Add quiz events
  quizRequests.forEach((quiz) => {
    if (quiz.status === "completed") {
      events.push({
        type: "quiz_completed",
        timestamp: quiz.created_at,
        data: quiz,
      });
    } else if (isEmployer) {
      events.push({
        type: "quiz_sent",
        timestamp: quiz.created_at,
        data: quiz,
      });
    } else {
      events.push({
        type: "quiz_received",
        timestamp: quiz.created_at,
        data: quiz,
      });
    }
  });

  // Add document request events for both sides
  documentRequests.forEach((doc) => {
    if (doc.status === "pending") {
      events.push({
        type: isEmployer ? "document_requested" : "document_received",
        timestamp: doc.created_at,
        data: doc,
      });
    }
  });

  // Add interview events
  interviews.forEach((interview) => {
    events.push({
      type: "interview",
      timestamp: interview.created_at,
      data: interview,
    });
  });

  // Sort by timestamp descending (newest first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (events.length === 0) return null;

  return (
    <div className="space-y-3 mb-4">
      {events.map((event, index) => (
        <motion.div
          key={`${event.type}-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {event.type === "quiz_sent" && (
            <QuizEventCard
              type="sent"
              candidateName={candidateName}
              questionCount={event.data.questions?.length || 0}
            />
          )}
          {event.type === "quiz_received" && (
            <QuizEventCard
              type="received"
              employerName={employerName}
              questionCount={event.data.questions?.length || 0}
            />
          )}
          {event.type === "quiz_completed" && (
            <QuizEventCard
              type="completed"
              candidateName={candidateName}
              questionCount={event.data.questions?.length || 0}
            />
          )}
          {event.type === "document_requested" && (
            <DocumentRequestSentCard
              documentType={event.data.document_type}
              customLabel={event.data.custom_label}
              sentAt={event.data.created_at}
            />
          )}
          {event.type === "document_received" && (
            <DocumentReceivedTimelineCard
              documentType={event.data.document_type}
              customLabel={event.data.custom_label}
            />
          )}
          {event.type === "interview" && (
            <InterviewEventCard
              type={
                event.data.status === "confirmed" ? "confirmed" : 
                event.data.status === "cancelled" ? "cancelled" : "scheduled"
              }
              scheduledAt={event.data.scheduled_at}
              isOutgoing={event.data.created_by === currentUserId}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
