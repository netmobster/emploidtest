import { motion } from "framer-motion";
import { Clock, Lock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChatGateCandidateProps {
  employerName?: string;
  jobTitle?: string;
  companyName?: string;
}

export function ChatGateCandidate({ 
  employerName,
  jobTitle,
  companyName 
}: ChatGateCandidateProps) {
  const handleNotifyMe = () => {
    toast.success("We'll notify you when the role details are ready!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center relative"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-6"
      >
        <Clock className="w-10 h-10 text-accent-foreground" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-semibold mb-2"
      >
        Almost There!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground max-w-md mb-6"
      >
        {employerName ? (
          <>
            <span className="font-medium text-foreground">{employerName}</span>
            {companyName && <span className="text-foreground"> from {companyName}</span>}
            {" "}is finalizing the details for{" "}
            <span className="font-medium text-foreground">{jobTitle || "this role"}</span>.
          </>
        ) : (
          <>
            The employer is finalizing the role details for{" "}
            <span className="font-medium text-foreground">{jobTitle || "this position"}</span>.
          </>
        )}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-muted/50 rounded-xl p-4 mb-8 max-w-sm"
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Lock className="w-5 h-5 shrink-0" />
          <span>
            Chat will unlock automatically once they complete the role details, 
            including pay range, work mode, and expectations.
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button variant="outline" onClick={handleNotifyMe}>
          <Bell className="w-4 h-4 mr-2" />
          Notify Me When Ready
        </Button>
      </motion.div>

      {/* Animated waiting indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 flex items-center gap-2"
      >
        <span className="text-sm text-muted-foreground">Waiting</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/50"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Visual decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.8 }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      </motion.div>
    </motion.div>
  );
}
