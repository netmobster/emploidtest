import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const verifiedRoles = [
  "Fractional CMO",
  "Growth Lead",
  "Series A Founder",
  "Brand Strategist",
  "Product Marketing",
  "Performance Lead",
  "Content Director",
];

export function HumanityBar() {
  return (
    <section className="py-16 md:py-20 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="max-w-4xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 font-serif-display">
            A private table of identity-verified humans.
          </h3>
          <p className="text-lg md:text-xl text-muted-foreground mb-10">
            <span className="text-primary font-semibold">0% Social Noise.</span>
            {" "}
            <span className="text-accent font-semibold">100% Strategic Alignment.</span>
          </p>
        </motion.div>

        {/* Verified Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {verifiedRoles.map((role, index) => (
            <motion.div
              key={role}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              className="group"
            >
              <div className="
                inline-flex items-center gap-2 px-4 py-2 rounded-full
                bg-card/80 backdrop-blur-sm border border-border/50
                hover:border-primary/30 hover:bg-card transition-all duration-300
                shadow-sm hover:shadow-md hover:shadow-primary/5
              ">
                <Shield className="w-3.5 h-3.5 text-primary/70 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                  Verified: {role}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
