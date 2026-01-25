import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const verifiedBadges = [
  "Fractional CMO",
  "Growth Lead",
  "Series A Founder",
  "Brand Strategist",
  "Product Marketing",
];

export function HumanityBar() {
  return (
    <section className="py-6 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm text-muted-foreground mb-4"
        >
          A private table of identity-verified humans.{" "}
          <span className="text-foreground font-medium">0% Social Noise.</span>{" "}
          <span className="text-primary font-medium">100% Strategic Alignment.</span>
        </motion.p>

        {/* Badge Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {verifiedBadges.map((badge, index) => (
            <motion.div
              key={badge}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * index, duration: 0.3 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/60 shadow-sm"
            >
              <CheckCircle className="w-3 h-3 text-success" />
              <span className="text-xs font-medium text-foreground">
                Verified: {badge}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}