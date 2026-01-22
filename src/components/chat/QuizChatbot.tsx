import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Sparkles, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: string;
  question: string;
  category: string;
}

interface QuizResponse {
  questionId: string;
  question: string;
  answer: string;
}

interface QuizChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  employerName: string;
  questions: QuizQuestion[];
  onComplete: (responses: QuizResponse[]) => void;
}

const encouragements = [
  "Great answer! 🎉",
  "Love it! Next up...",
  "Awesome! Keep going! ✨",
  "Perfect! You're doing great!",
  "Nice one! 🙌",
];

export function QuizChatbot({
  isOpen,
  onClose,
  employerName,
  questions,
  onComplete,
}: QuizChatbotProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [messages, setMessages] = useState<
    { type: "bot" | "user"; content: string; isEncouragement?: boolean }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && currentIndex === -1) {
      // Start the quiz with intro message
      setMessages([
        {
          type: "bot",
          content: `Hey there! 👋 ${employerName} wants to get to know you better with a quick 2-minute quiz. Ready to have some fun?`,
        },
      ]);
      
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setCurrentIndex(0);
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              content: `Let's dive in! Here's your first question:\n\n"${questions[0].question}"`,
            },
          ]);
        }, 1000);
      }, 1500);
    }
  }, [isOpen, currentIndex, employerName, questions]);

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return;

    const currentQuestion = questions[currentIndex];
    const newResponse: QuizResponse = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      answer: currentAnswer.trim(),
    };

    setResponses((prev) => [...prev, newResponse]);
    setMessages((prev) => [...prev, { type: "user", content: currentAnswer.trim() }]);
    setCurrentAnswer("");

    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      // Quiz complete
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: `All set! 🎊 Sending these over to ${employerName}. Thanks for sharing—this is going to help them get to know the real you!`,
          },
        ]);
        setIsComplete(true);
      }, 1200);
    } else {
      // Show encouragement then next question
      const encouragement =
        encouragements[Math.floor(Math.random() * encouragements.length)];
      
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { type: "bot", content: encouragement, isEncouragement: true },
        ]);

        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setCurrentIndex(nextIndex);
            setMessages((prev) => [
              ...prev,
              {
                type: "bot",
                content: `Question ${nextIndex + 1} of ${questions.length}:\n\n"${questions[nextIndex].question}"`,
              },
            ]);
            inputRef.current?.focus();
          }, 800);
        }, 500);
      }, 1000);
    }
  };

  const handleComplete = () => {
    onComplete(responses);
    // Reset state
    setCurrentIndex(-1);
    setResponses([]);
    setMessages([]);
    setIsComplete(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Emploid Bot</h3>
              <p className="text-xs text-muted-foreground">Get-to-Know-You Quiz</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-2",
                  msg.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.type === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.type === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : msg.isEncouragement
                      ? "bg-green-500/10 text-green-600 border border-green-500/20"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.type === "user" && (
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted-foreground/50"
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-background">
          {isComplete ? (
            <Button onClick={handleComplete} className="w-full gap-2">
              <Sparkles className="w-4 h-4" />
              Done!
            </Button>
          ) : (
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="min-h-[44px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitAnswer();
                  }
                }}
                disabled={currentIndex < 0 || isTyping}
              />
              <Button
                size="icon"
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || isTyping}
                className="h-11 w-11 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
