import { useState } from "react";
import { motion } from "framer-motion";
import { Handshake, Clock, Heart, BookOpen, Users, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkLoveLanguageModal from "./WorkLoveLanguageModal";

const cards = [
  {
    id: "retention",
    headline: "Stop searching. Start staying.",
    body: "High-turnover is a language barrier. We match candidates and teams based on long-term compatibility, ensuring your next \"first day\" is the start of a multi-year partnership.",
    icons: [Handshake, Clock],
  },
  {
    id: "empathy",
    headline: "Day One, Decoded.",
    body: "Skip the six-month guessing game. We provide a \"User Manual\" for the manager-employee relationship, so both sides know exactly how to motivate, support, and communicate from the very first \"Hello.\"",
    icons: [Heart, BookOpen],
  },
  {
    id: "inclusion",
    headline: "Belong as You Are.",
    body: "Stop looking for \"culture fit\" and start finding \"culture add.\" We match based on shared values, helping talent find a home and employers build diverse, high-performance teams that actually click.",
    icons: [Users, Puzzle],
  },
];

const HowItWorks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="how-it-works" className="py-10 px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8"
      >
        How it Works
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {cards.map((card, index) => {
          const [Icon1, Icon2] = card.icons;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="group bg-card rounded-3xl p-8 shadow-card hover-lift border border-border/50"
            >
              {/* Dual-element icon */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                  <Icon1 className="w-6 h-6 text-primary absolute -translate-x-2" />
                  <Icon2 className="w-6 h-6 text-accent absolute translate-x-2" />
                </div>
              </div>

              {/* Headline */}
              <h3 className="text-xl font-bold text-foreground mb-4 text-center group-hover:text-primary transition-colors">
                {card.headline}
              </h3>

              {/* Body */}
              <p className="text-muted-foreground text-center leading-relaxed">
                {card.body}
              </p>

              {/* Subtle gradient accent line */}
              <div className="mt-6 h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-primary to-accent opacity-60 group-hover:opacity-100 group-hover:w-24 transition-all" />
            </motion.div>
          );
        })}
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex justify-center mt-8 mb-10"
      >
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gradient-hero text-primary-foreground font-semibold px-8 py-3 rounded-xl hover-lift"
        >
          See how we match humans to humans
        </Button>
      </motion.div>

      {/* Modal */}
      <WorkLoveLanguageModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </section>
  );
};

export default HowItWorks;
