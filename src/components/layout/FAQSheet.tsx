import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, Users, MessageCircle, UserCircle, Settings } from "lucide-react";

interface FAQSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const faqCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    questions: [
      {
        question: "How does matching work?",
        answer: "When you swipe right on a job or candidate and they swipe right on you too, it's a match! You'll both be notified and can start chatting immediately. Our culture-based matching ensures you're paired with opportunities that align with your values and work style."
      },
      {
        question: "What makes a good profile?",
        answer: "A strong profile includes a clear photo, a compelling bio that highlights your personality and goals, and honest answers to the culture questions. The more authentic you are, the better your matches will be!"
      },
    ]
  },
  {
    id: "matching",
    title: "Matching & Synergy",
    icon: Users,
    questions: [
      {
        question: "How do I know if someone is interested?",
        answer: "You'll receive a notification when you get a match. You can also check your Matches page to see all your current connections and start conversations with them."
      },
      {
        question: "What is the Synergy Score?",
        answer: "The Synergy Score is a percentage that shows how well you align with a role or candidate based on culture preferences, work style, and values. Higher scores indicate stronger compatibility."
      },
      {
        question: "What if I change my mind about a swipe?",
        answer: "Currently, swipes are final to encourage thoughtful decisions. Take your time reviewing each profile before making your choice. Quality over quantity leads to better matches!"
      }
    ]
  },
  {
    id: "chat",
    title: "Chat & Communication",
    icon: MessageCircle,
    questions: [
      {
        question: "How do I message my matches?",
        answer: "Once you have a match, go to your Matches page and click on any match to open the chat. You can send messages, share your thoughts, and schedule interviews or meetings."
      },
      {
        question: "What is the Chat Gate?",
        answer: "The Chat Gate ensures quality conversations by requiring both parties to complete certain steps before messaging. Employers must finalize their job brief, and candidates must complete their synergy questionnaire."
      }
    ]
  },
  {
    id: "profile",
    title: "Profile & Settings",
    icon: UserCircle,
    questions: [
      {
        question: "Can I update my preferences later?",
        answer: "Absolutely! You can update your profile, bio, and culture preferences at any time from your dashboard. Your matches will reflect your updated preferences going forward."
      },
      {
        question: "How do I verify my profile?",
        answer: "Candidates can verify their identity through LinkedIn verification. Employers can verify their company domain by confirming their work email address."
      }
    ]
  },
  {
    id: "technical",
    title: "Technical & Support",
    icon: Settings,
    questions: [
      {
        question: "Why can't I see certain features?",
        answer: "Some features are gated behind profile completion milestones or verification status. Complete your profile and verify your identity to unlock all features."
      },
      {
        question: "How do I contact support?",
        answer: "You can reach our support team by emailing wearecleardigital@gmail.com. We typically respond within 24-48 hours."
      }
    ]
  }
];

export function FAQSheet({ open, onOpenChange }: FAQSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-5 h-5 text-primary" />
            Knowledge Base
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Find answers to common questions about Emploid
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {faqCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{category.title}</h3>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`${category.id}-${index}`}
                      className="border-border/50"
                    >
                      <AccordionTrigger className="text-left text-sm hover:no-underline py-3">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm pb-4">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground text-center">
            Still have questions?{" "}
            <a 
              href="mailto:wearecleardigital@gmail.com" 
              className="text-primary hover:underline font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
