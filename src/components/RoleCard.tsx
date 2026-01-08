import { Role } from "@/lib/gameData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface RoleCardProps {
  role: Role;
  isSelected?: boolean;
  onClick: () => void;
  delay?: number;
  isDisabled?: boolean;
  disabledReason?: string;
}

const RoleCard = ({
  role,
  isSelected,
  onClick,
  delay = 0,
  isDisabled = false,
  disabledReason,
}: RoleCardProps) => {
  const Icon = role.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={isDisabled ? {} : { scale: 1.02, y: -4 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={cn(
        "group relative w-full p-6 rounded-2xl text-left transition-all duration-300",
        "bg-card shadow-card",
        "border-2",
        isDisabled
          ? "opacity-50 cursor-not-allowed border-transparent"
          : isSelected
          ? "border-primary shadow-glow hover:shadow-lg"
          : "border-transparent hover:border-primary/20 hover:shadow-lg"
      )}
    >
      {/* Disabled overlay */}
      {isDisabled && (
        <div className="absolute inset-0 bg-muted/30 rounded-2xl flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-muted-foreground bg-background/90 px-3 py-1.5 rounded-full text-sm">
            <Lock className="w-4 h-4" />
            {disabledReason || "Unavailable"}
          </div>
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && !isDisabled && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-6 h-6 rounded-full gradient-primary flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
          isDisabled
            ? "bg-muted text-muted-foreground"
            : isSelected
            ? "gradient-primary text-primary-foreground"
            : "bg-primary/10 text-primary group-hover:bg-primary/20"
        )}
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <h3
        className={cn(
          "text-lg font-bold mb-1",
          isDisabled ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {role.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
      <span
        className={cn(
          "inline-block text-xs font-medium px-2 py-1 rounded-full",
          isDisabled
            ? "bg-muted text-muted-foreground"
            : "text-primary bg-primary/10"
        )}
      >
        {role.category}
      </span>
    </motion.button>
  );
};

export default RoleCard;
