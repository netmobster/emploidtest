import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, FileEdit, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleDefinitionDialog } from "@/components/role/RoleDefinitionDialog";

interface ChatGateEmployerProps {
  jobId: string;
  jobTitle?: string;
  candidateName?: string;
  onRoleComplete?: () => void;
}

export function ChatGateEmployer({ 
  jobId, 
  jobTitle,
  candidateName,
  onRoleComplete 
}: ChatGateEmployerProps) {
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
        >
          <Lock className="w-10 h-10 text-primary" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold mb-2"
        >
          Chat is Locked
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground max-w-md mb-8"
        >
          {candidateName ? (
            <>
              <span className="font-medium text-foreground">{candidateName}</span> is waiting to chat! 
              Complete the role details for{" "}
              <span className="font-medium text-foreground">{jobTitle || "this position"}</span>{" "}
              to unlock the conversation.
            </>
          ) : (
            <>
              Complete the role details for{" "}
              <span className="font-medium text-foreground">{jobTitle || "this position"}</span>{" "}
              to unlock the chat with your match.
            </>
          )}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <Button size="lg" onClick={() => setShowRoleDialog(true)}>
            <FileEdit className="w-5 h-5 mr-2" />
            Complete Role Details
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-sm text-muted-foreground">
            This ensures both parties have clear expectations before connecting.
          </p>
        </motion.div>

        {/* Visual decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6 }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        </motion.div>
      </motion.div>

      <RoleDefinitionDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        jobId={jobId}
        onComplete={onRoleComplete}
      />
    </>
  );
}
