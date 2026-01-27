import { motion } from "framer-motion";
import { QuizEventCard } from "./QuizEventCard";
import { DocumentRequestSentCard } from "./DocumentRequestSentCard";
import { InterviewEventCard } from "./InterviewEventCard";
import { useDocumentRequests } from "@/hooks/useDocumentRequests";
import { useInterviews } from "@/hooks/useInterviews";

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

  // Get employer's pending document requests (sent by them)
  const pendingDocumentRequests = documentRequests.filter(
    (req) => req.status === "pending" && req.requester_id === currentUserId
  );

  // Build a timeline of all events sorted by date
  const events: {
    type: "quiz_sent" | "quiz_completed" | "document_requested" | "interview";
    timestamp: string;
    data: any;
  }[] = [];

  // Add quiz events
  quizRequests.forEach((quiz) => {
    if (isEmployer) {
      // Employer sees "sent" status
      events.push({
        type: quiz.status === "completed" ? "quiz_completed" : "quiz_sent",
        timestamp: quiz.created_at,
        data: quiz,
      });
    }
  });

  // Add document request events (employer view - sent)
  if (isEmployer) {
    pendingDocumentRequests.forEach((doc) => {
      events.push({
        type: "document_requested",
        timestamp: doc.created_at,
        data: doc,
      });
    });
  }

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
