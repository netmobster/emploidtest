import { motion } from "framer-motion";
import { X, Heart, Star, RotateCcw, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SwipeControlsProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  disabled?: boolean;
  onShortlist?: () => void;
  isShortlisted?: boolean;
  shortlistedRoles?: string[];
}

const SwipeControls = ({
  onPass,
  onLike,
  onSuperLike,
  onUndo,
  canUndo = false,
  disabled = false,
  onShortlist,
  isShortlisted = false,
  shortlistedRoles = [],
}: SwipeControlsProps) => {
  const buttonBase = "flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const shortlistTooltipContent = isShortlisted && shortlistedRoles.length > 0
    ? `Shortlisted for: ${shortlistedRoles.join(", ")}`
    : isShortlisted
    ? "Already shortlisted"
    : "Add to shortlist";
  
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Undo Button */}
      {onUndo && (
        <motion.button
          whileHover={{ scale: canUndo && !disabled ? 1.1 : 1 }}
          whileTap={{ scale: canUndo && !disabled ? 0.95 : 1 }}
          onClick={onUndo}
          disabled={!canUndo || disabled}
          className={cn(
            buttonBase,
            "w-12 h-12 bg-secondary border-2 border-border text-muted-foreground",
            canUndo && !disabled && "hover:border-yellow-500 hover:text-yellow-500"
          )}
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      )}

      {/* Shortlist Button with Tooltip */}
      {onShortlist && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: disabled ? 1 : 1.1 }}
                whileTap={{ scale: disabled ? 1 : 0.95 }}
                onClick={onShortlist}
                disabled={disabled}
                className={cn(
                  buttonBase,
                  "w-12 h-12 bg-secondary border-2",
                  isShortlisted 
                    ? "border-amber-500 text-amber-500 bg-amber-500/10" 
                    : "border-amber-500/30 text-amber-500",
                  !disabled && !isShortlisted && "hover:bg-amber-500/10 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20"
                )}
              >
                <Bookmark className={cn("w-5 h-5", isShortlisted && "fill-current")} />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{shortlistTooltipContent}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Pass Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onPass}
        disabled={disabled}
        className={cn(
          buttonBase,
          "w-16 h-16 bg-secondary border-2 border-red-500/30 text-red-500",
          !disabled && "hover:bg-red-500/10 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20"
        )}
      >
        <X className="w-8 h-8" />
      </motion.button>

      {/* Super Like Button */}
      {onSuperLike && (
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          onClick={onSuperLike}
          disabled={disabled}
          className={cn(
            buttonBase,
            "w-14 h-14 bg-secondary border-2 border-blue-500/30 text-blue-500",
            !disabled && "hover:bg-blue-500/10 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
          )}
        >
          <Star className="w-6 h-6" />
        </motion.button>
      )}

      {/* Like Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onLike}
        disabled={disabled}
        className={cn(
          buttonBase,
          "w-16 h-16 bg-secondary border-2 border-green-500/30 text-green-500",
          !disabled && "hover:bg-green-500/10 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20"
        )}
      >
        <Heart className="w-8 h-8" />
      </motion.button>
    </div>
  );
};

export default SwipeControls;
