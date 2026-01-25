import { motion } from "framer-motion";
import { User, Briefcase, Target, Users, Shield, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const candidateBullets = [
  {
    title: "The 'YOU' Profile",
    description: "Stop being a resume. Show your real-world impact and the quirks that make you a great teammate.",
    icon: User,
  },
  {
    title: "Team Discovery",
    description: "See the hobbies, missions, and team chemistry before you apply. You're joining humans, not a job title.",
    icon: Users,
  },
  {
    title: "The Day 14 Goal",
    description: "Skip the 'First Date' performance. We match on personality so your first day feels like your second week.",
    icon: Target,
  },
];

const employerBullets = [
  {
    title: "Stop Recruiting, Start Briefing",
    description: "Define the 'Magic' your team is missing. Brief the system like you would a high-end partner.",
    icon: Briefcase,
  },
  {
    title: "1:1 Over 1,000:1,000",
    description: "Automation has broken hiring. We return to 1:1 communication where quality and chemistry are the only metrics.",
    icon: Zap,
  },
  {
    title: "Verified Signal",
    description: "Every candidate is identity-bound. No AI-generated ghost profiles—just real people ready to do real work.",
    icon: Shield,
  },
];

export function MirrorViewSection() {
  const navigate = useNavigate();

  return (
    <section className="py-6 md:py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
          {/* Candidate Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl" />
            <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-accent/20 p-6 lg:p-8 h-full flex flex-col">
              {/* Header */}
              <div className="mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mb-3">
                  <User className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">
                  Find Your Work
                </h3>
                <p className="text-sm text-muted-foreground mt-1">For candidates seeking meaningful roles</p>
              </div>

              {/* Bullets */}
              <div className="space-y-4 flex-1">
                {candidateBullets.map((bullet, index) => {
                  const Icon = bullet.icon;
                  return (
                    <motion.div
                      key={bullet.title}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * index, duration: 0.4 }}
                      className="flex gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm mb-0.5">{bullet.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{bullet.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => navigate("/auth?type=candidate")}
                className="mt-5 w-full gradient-accent text-accent-foreground"
              >
                Find Your Team
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Employer Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl" />
            <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-primary/20 p-6 lg:p-8 h-full flex flex-col">
              {/* Header */}
              <div className="mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-3">
                  <Briefcase className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">
                  Build Your Team
                </h3>
                <p className="text-sm text-muted-foreground mt-1">For employers seeking lasting hires</p>
              </div>

              {/* Bullets */}
              <div className="space-y-4 flex-1">
                {employerBullets.map((bullet, index) => {
                  const Icon = bullet.icon;
                  return (
                    <motion.div
                      key={bullet.title}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * index, duration: 0.4 }}
                      className="flex gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm mb-0.5">{bullet.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{bullet.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => navigate("/auth?type=employer")}
                className="mt-5 w-full gradient-primary text-primary-foreground"
              >
                Find Your Unicorn
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}