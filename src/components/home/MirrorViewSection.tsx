import { motion } from "framer-motion";
import { User, Briefcase, Target, Users, Shield, Zap } from "lucide-react";

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
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {/* Candidate Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-3xl" />
            <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl border border-accent/20 p-8 lg:p-10 h-full">
              {/* Header */}
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground font-serif-display">
                  Find Your Work
                </h3>
                <p className="text-muted-foreground mt-2">For candidates seeking meaningful roles</p>
              </div>

              {/* Bullets */}
              <div className="space-y-6">
                {candidateBullets.map((bullet, index) => {
                  const Icon = bullet.icon;
                  return (
                    <motion.div
                      key={bullet.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{bullet.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{bullet.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Employer Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl" />
            <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl border border-primary/20 p-8 lg:p-10 h-full">
              {/* Header */}
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground font-serif-display">
                  Build Your Team
                </h3>
                <p className="text-muted-foreground mt-2">For employers seeking lasting hires</p>
              </div>

              {/* Bullets */}
              <div className="space-y-6">
                {employerBullets.map((bullet, index) => {
                  const Icon = bullet.icon;
                  return (
                    <motion.div
                      key={bullet.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{bullet.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{bullet.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
