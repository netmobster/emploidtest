import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Compass, Award, Users, Shield, Target } from "lucide-react";

const languages = [
  {
    name: "Autonomy",
    icon: Compass,
    description: "You thrive when trusted to own your process and value outcomes over check-ins.",
  },
  {
    name: "Recognition",
    icon: Award,
    description: "You are fueled by visibility and feel most connected when contributions are celebrated.",
  },
  {
    name: "Collaboration",
    icon: Users,
    description: "You crave the energy of a shared mission and 'we're in this together' brainstorming.",
  },
  {
    name: "Security",
    icon: Shield,
    description: "You value work-life boundaries, clear expectations, and a stable, reliable environment.",
  },
  {
    name: "Impact",
    icon: Target,
    description: "You are driven by purpose and need to see the 'Why' behind every project you touch.",
  },
];

interface WorkLoveLanguageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WorkLoveLanguageModal = ({ open, onOpenChange }: WorkLoveLanguageModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-none shadow-none rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary text-center">
            The 5 Work Love Languages
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Introduction */}
          <p className="text-muted-foreground text-center leading-relaxed">
            Work is a relationship. Your Work Love Language defines how you thrive, contribute, and stay energized. Discover the science behind your click
          </p>

          {/* Languages List */}
          <div className="space-y-4">
            {languages.map((language) => {
              const Icon = language.icon;
              return (
                <div key={language.name} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">{language.name}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {language.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Outro */}
          <p className="text-muted-foreground text-center leading-relaxed text-sm">
            Matching languages isn't just about 'fitting in'—it's about long-term compatibility. When teams speak the same language, retention rises and great work feels effortless.
          </p>

          {/* Button */}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full gradient-hero text-primary-foreground font-semibold py-3 rounded-xl"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkLoveLanguageModal;
