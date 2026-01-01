import { useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import SwipeableProfileCard from "./SwipeableProfileCard";
import SwipeControls from "./SwipeControls";

interface SwipeStackProps<T> {
  items: T[];
  type: "candidate" | "job";
  onSwipe: (item: T, direction: "like" | "pass" | "super_like") => void;
  onEmpty?: () => void;
}

const SwipeStack = <T extends { id: string; matchScore: number }>({
  items,
  type,
  onSwipe,
  onEmpty,
}: SwipeStackProps<T>) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [swipeHistory, setSwipeHistory] = useState<{ item: T; direction: "like" | "pass" | "super_like" }[]>([]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const currentItem = items[currentIndex];
  const nextItem = items[currentIndex + 1];

  const handleSwipe = useCallback((direction: "like" | "pass" | "super_like") => {
    if (!currentItem) return;

    setSwipeHistory(prev => [...prev, { item: currentItem, direction }]);
    setExitDirection(direction === "pass" ? "left" : "right");
    onSwipe(currentItem, direction);

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setExitDirection(null);
      x.set(0);

      if (currentIndex + 1 >= items.length && onEmpty) {
        onEmpty();
      }
    }, 200);
  }, [currentItem, currentIndex, items.length, onSwipe, onEmpty, x]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe("like");
    } else if (info.offset.x < -threshold) {
      handleSwipe("pass");
    }
  }, [handleSwipe]);

  const handleUndo = useCallback(() => {
    if (swipeHistory.length === 0) return;
    setSwipeHistory(prev => prev.slice(0, -1));
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, [swipeHistory.length]);

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
    <div className="flex flex-col h-full">
      {/* Progress indicator */}
      <div className="px-6 py-4">
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
      <div className="flex-1 relative px-4 pb-4 overflow-hidden">
        {/* Next card (background) */}
        {nextItem && (
          <div className="absolute inset-4 transform scale-95 opacity-50">
            <SwipeableProfileCard data={nextItem as any} type={type} />
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
            <SwipeableProfileCard
              data={currentItem as any}
              type={type}
              dragX={x.get()}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="p-6 pt-2">
        <SwipeControls
          onPass={() => handleSwipe("pass")}
          onLike={() => handleSwipe("like")}
          onSuperLike={() => handleSwipe("super_like")}
          onUndo={handleUndo}
          canUndo={swipeHistory.length > 0}
        />
      </div>
    </div>
  );
};

export default SwipeStack;
