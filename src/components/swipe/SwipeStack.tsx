import { useState, useCallback, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import FullProfileCard, { CandidateData, JobData } from "./FullProfileCard";
import { SwipeLoadingOverlay } from "./SwipeLoadingOverlay";

interface SwipeStackProps<T> {
  items: T[];
  type: "candidate" | "job";
  onSwipe: (item: T, direction: "like" | "pass" | "super_like") => void;
  onEmpty?: () => void;
  isMatchedFn?: (itemId: string) => boolean;
}

const SwipeStack = <T extends { id: string; matchScore: number }>({
  items,
  type,
  onSwipe,
  onEmpty,
  isMatchedFn,
}: SwipeStackProps<T>) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [swipeHistory, setSwipeHistory] = useState<{ item: T; direction: "like" | "pass" | "super_like" }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCheckingMatch, setIsCheckingMatch] = useState(false);
  const [checkingMatchType, setCheckingMatchType] = useState<"like" | "super_like">("like");
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.7, 1, 1, 1, 0.7]);

  const currentItem = items[currentIndex];
  const nextItem = items[currentIndex + 1];

  const handleSwipe = useCallback((direction: "like" | "pass" | "super_like") => {
    if (!currentItem || isAnimating) {
      console.log("[SwipeStack] handleSwipe blocked:", { currentItem: !!currentItem, isAnimating });
      return;
    }

    console.log("[SwipeStack] handleSwipe:", { id: currentItem.id, direction, currentIndex });

    setIsAnimating(true);
    setSwipeHistory(prev => [...prev, { item: currentItem, direction }]);
    setExitDirection(direction === "pass" ? "left" : "right");
    
    // Show loading overlay for likes (checking for match)
    if (direction !== "pass") {
      setIsCheckingMatch(true);
      setCheckingMatchType(direction);
    }
    
    // Fire onSwipe and handle result
    Promise.resolve(onSwipe(currentItem, direction))
      .then((result) => {
        console.log("[SwipeStack] onSwipe completed:", result);
      })
      .catch((err) => {
        console.error("[SwipeStack] onSwipe error:", err);
      })
      .finally(() => {
        // Hide loading overlay after a short delay
        setTimeout(() => {
          setIsCheckingMatch(false);
        }, 600);
      });

    // Advance to next card after exit animation completes
    setTimeout(() => {
      console.log("[SwipeStack] Advancing to next card after animation");
      setCurrentIndex(prev => prev + 1);
      setExitDirection(null);
      x.set(0);
      setIsAnimating(false);

      if (currentIndex + 1 >= items.length && onEmpty) {
        onEmpty();
      }
    }, 350);
  }, [currentItem, currentIndex, items.length, onSwipe, onEmpty, x, isAnimating]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (isAnimating) return;
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe("like");
    } else if (info.offset.x < -threshold) {
      handleSwipe("pass");
    }
  }, [handleSwipe, isAnimating]);

  const handleUndo = useCallback(() => {
    if (swipeHistory.length === 0) return;
    setSwipeHistory(prev => prev.slice(0, -1));
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, [swipeHistory.length]);

  // Check if current item is matched
  const isCurrentMatched = currentItem && isMatchedFn ? isMatchedFn(currentItem.id) : false;

  if (!currentItem) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">You're all caught up!</h2>
          <p className="text-muted-foreground">
            No more {type === "candidate" ? "candidates" : "jobs"} to review right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Progress indicator */}
      <div className="px-6 py-4 flex-shrink-0">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{currentIndex + 1} of {items.length}</span>
          <span>{items.length - currentIndex - 1} remaining</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative px-4 pb-4 overflow-hidden min-h-0">
        {/* Loading Overlay */}
        <SwipeLoadingOverlay 
          isVisible={isCheckingMatch} 
          type={checkingMatchType}
        />

        {/* Next card (background) - simplified preview */}
        {nextItem && (
          <div className="absolute inset-4 transform scale-95 opacity-30 pointer-events-none">
            <div className="w-full h-full bg-card rounded-3xl shadow-card" />
          </div>
        )}

        {/* Current card (interactive) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            className="absolute inset-4 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              x: exitDirection === "left" ? -300 : exitDirection === "right" ? 300 : 0,
              opacity: 0,
              transition: { duration: 0.2 }
            }}
          >
            <FullProfileCard
              ref={cardRef}
              data={currentItem as unknown as CandidateData | JobData}
              type={type}
              isMatched={isCurrentMatched}
              dragX={x.get()}
              onPass={() => handleSwipe("pass")}
              onLike={() => handleSwipe("like")}
              onSuperLike={() => handleSwipe("super_like")}
              onUndo={handleUndo}
              canUndo={swipeHistory.length > 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SwipeStack;
