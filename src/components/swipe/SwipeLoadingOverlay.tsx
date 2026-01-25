import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Heart, Sparkles } from "lucide-react";

interface SwipeLoadingOverlayProps {
  isVisible: boolean;
  type?: "like" | "super_like";
}

export function SwipeLoadingOverlay({ isVisible, type = "like" }: SwipeLoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-3xl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`p-4 rounded-full ${
                type === "super_like" 
                  ? "bg-amber-500/20" 
                  : "bg-primary/20"
              }`}
            >
              {type === "super_like" ? (
                <Sparkles className="w-8 h-8 text-amber-500" />
              ) : (
                <Heart className="w-8 h-8 text-primary" />
              )}
            </motion.div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Checking for match...
              </p>
              <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Please wait</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
