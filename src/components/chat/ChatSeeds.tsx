import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Target, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatSeedsProps {
  currentUserProfile: {
    skills?: string[] | null;
    synergy_scores?: Record<string, number> | null;
    culture_preferences?: Record<string, number> | null;
  };
  otherUserProfile: {
    skills?: string[] | null;
    synergy_scores?: Record<string, number> | null;
    culture_preferences?: Record<string, number> | null;
    full_name?: string;
  };
  jobInfo?: {
    mission_statement?: string | null;
    big_rocks?: { title: string }[] | null;
  };
  onSelectSeed: (message: string) => void;
  isVisible: boolean;
}

interface Seed {
  id: string;
  icon: React.ElementType;
  message: string;
  type: "skill" | "mission" | "vibe" | "fallback";
}

const synergyTraitLabels: Record<string, string> = {
  autonomy: "working independently",
  collaboration: "team collaboration",
  speed: "moving fast",
  precision: "attention to detail",
  innovation: "creative innovation",
  stability: "process stability",
  structure: "structured environments",
  flexibility: "flexible approaches",
};

export function ChatSeeds({
  currentUserProfile,
  otherUserProfile,
  jobInfo,
  onSelectSeed,
  isVisible,
}: ChatSeedsProps) {
  const [dismissed, setDismissed] = useState(false);

  const seeds = useMemo(() => {
    const generatedSeeds: Seed[] = [];

    // 1. Skill Seed - Find shared skills
    const currentSkills = currentUserProfile.skills || [];
    const otherSkills = otherUserProfile.skills || [];
    const sharedSkills = currentSkills.filter((s) => 
      otherSkills.some((os) => os.toLowerCase() === s.toLowerCase())
    );

    if (sharedSkills.length > 0) {
      const skill = sharedSkills[0];
      generatedSeeds.push({
        id: "skill",
        icon: Zap,
        message: `I noticed we both work with ${skill}. How are you using that in your current stack?`,
        type: "skill",
      });
    }

    // 2. Mission Seed - Based on job mission
    if (jobInfo?.mission_statement) {
      const mission = jobInfo.mission_statement.slice(0, 50);
      generatedSeeds.push({
        id: "mission",
        icon: Target,
        message: `I'm interested in your focus on "${mission}..." What's the biggest hurdle you're tackling there right now?`,
        type: "mission",
      });
    } else if (jobInfo?.big_rocks && jobInfo.big_rocks.length > 0) {
      const rock = (jobInfo.big_rocks[0] as { title: string }).title;
      generatedSeeds.push({
        id: "mission",
        icon: Target,
        message: `I see "${rock}" is a key priority. What would success look like in the first 90 days?`,
        type: "mission",
      });
    }

    // 3. Vibe Seed - Find shared synergy traits
    const currentSynergy = currentUserProfile.synergy_scores || {};
    const otherSynergy = otherUserProfile.synergy_scores || {};
    
    // Find highest matching traits
    let bestMatch = { trait: "", score: 0 };
    Object.keys(currentSynergy).forEach((trait) => {
      if (otherSynergy[trait]) {
        const similarity = 100 - Math.abs(currentSynergy[trait] - otherSynergy[trait]);
        if (similarity > bestMatch.score && similarity > 70) {
          bestMatch = { trait, score: similarity };
        }
      }
    });

    if (bestMatch.trait && synergyTraitLabels[bestMatch.trait]) {
      generatedSeeds.push({
        id: "vibe",
        icon: Heart,
        message: `We both seem to value ${synergyTraitLabels[bestMatch.trait]}. How does that usually play out in your day-to-day?`,
        type: "vibe",
      });
    }

    // 4. Fallback if we don't have enough seeds
    if (generatedSeeds.length < 3) {
      generatedSeeds.push({
        id: "fallback",
        icon: Sparkles,
        message: `What's the #1 "Big Rock" you're looking to move this month?`,
        type: "fallback",
      });
    }

    return generatedSeeds.slice(0, 3);
  }, [currentUserProfile, otherUserProfile, jobInfo]);

  if (!isVisible || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="px-4 py-4 border-b border-border bg-secondary/30"
      >
        <div className="max-w-lg mx-auto">
          {/* Concierge header */}
          <p className="text-xs italic text-muted-foreground mb-3 text-center">
            Skip the small talk. Here are some shared points to start with:
          </p>

          {/* Seed buttons */}
          <div className="space-y-2">
            {seeds.map((seed, index) => {
              const Icon = seed.icon;
              return (
                <motion.div
                  key={seed.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                    onClick={() => onSelectSeed(seed.message)}
                  >
                    <Icon className="w-4 h-4 mr-3 flex-shrink-0 text-primary" />
                    <span className="text-sm leading-relaxed">{seed.message}</span>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Dismiss option */}
          <button
            onClick={() => setDismissed(true)}
            className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            I'll start my own way
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
