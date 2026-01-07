import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "How does matching work?",
    answer: "When you swipe right on a job or candidate and they swipe right on you too, it's a match! You'll both be notified and can start chatting immediately. Our culture-based matching ensures you're paired with opportunities that align with your values and work style."
  },
  {
    question: "What makes a good profile?",
    answer: "A strong profile includes a clear photo, a compelling bio that highlights your personality and goals, and honest answers to the culture questions. The more authentic you are, the better your matches will be!"
  },
  {
    question: "How do I know if someone is interested?",
    answer: "You'll receive a notification when you get a match. You can also check your Matches page to see all your current connections and start conversations with them."
  },
  {
    question: "Can I update my preferences later?",
    answer: "Absolutely! You can update your profile, bio, and culture preferences at any time from your dashboard. Your matches will reflect your updated preferences going forward."
  },
  {
    question: "How do I message my matches?",
    answer: "Once you have a match, go to your Matches page and click on any match to open the chat. You can send messages, share your thoughts, and schedule interviews or meetings."
  },
  {
    question: "What if I change my mind about a swipe?",
    answer: "Currently, swipes are final to encourage thoughtful decisions. Take your time reviewing each profile before making your choice. Quality over quantity leads to better matches!"
  }
];

const FAQSection = () => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQSection;
