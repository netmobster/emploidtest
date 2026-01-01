import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: () => void;
  matchedProfile: {
    name: string;
    avatar?: string;
    title?: string;
  };
  currentUser: {
    name: string;
    avatar?: string;
  };
  matchScore?: number;
}

const MatchCelebration = ({
  isOpen,
  onClose,
  onStartChat,
  matchedProfile,
  currentUser,
  matchScore,
}: MatchCelebrationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          {/* Confetti effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: [
                      "hsl(var(--primary))",
                      "hsl(var(--accent))",
                      "#22c55e",
                      "#3b82f6",
                      "#f59e0b",
                      "#ec4899",
                    ][Math.floor(Math.random() * 6)],
                  }}
                  initial={{ y: -20, opacity: 1, scale: 0 }}
                  animate={{
                    y: window.innerHeight + 20,
                    opacity: [1, 1, 0],
                    scale: [0, 1, 1],
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative text-center px-8 py-12 max-w-md mx-4"
          >
            {/* Sparkles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 pointer-events-none"
            >
              <Sparkles className="absolute top-0 left-1/4 w-6 h-6 text-yellow-400" />
              <Sparkles className="absolute top-1/4 right-0 w-4 h-4 text-pink-400" />
              <Sparkles className="absolute bottom-1/4 left-0 w-5 h-5 text-blue-400" />
              <Sparkles className="absolute bottom-0 right-1/4 w-6 h-6 text-green-400" />
            </motion.div>

            {/* Avatars */}
            <div className="flex items-center justify-center mb-8">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 rounded-full bg-secondary border-4 border-primary flex items-center justify-center text-3xl font-bold text-primary overflow-hidden"
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="relative z-10 -mx-4"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 rounded-full bg-secondary border-4 border-accent flex items-center justify-center text-3xl font-bold text-accent overflow-hidden"
              >
                {matchedProfile.avatar ? (
                  <img src={matchedProfile.avatar} alt={matchedProfile.name} className="w-full h-full object-cover" />
                ) : (
                  matchedProfile.name.charAt(0)
                )}
              </motion.div>
            </div>

            {/* Text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-4xl font-black bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
                It's a Match!
              </h2>
              <p className="text-lg text-muted-foreground mb-2">
                You and <span className="font-semibold text-foreground">{matchedProfile.name}</span> liked each other
              </p>
              {matchScore && (
                <p className="text-sm text-muted-foreground">
                  <span className="text-green-500 font-bold">{matchScore}%</span> compatibility
                </p>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col gap-3 mt-8"
            >
              <Button
                size="lg"
                className="w-full text-lg py-6 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                onClick={onStartChat}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Send a Message
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={onClose}
              >
                Keep Swiping
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchCelebration;
