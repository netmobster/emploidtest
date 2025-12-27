import { Role } from "@/lib/gameData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RoleCardProps {
  role: Role;
  isSelected?: boolean;
  onClick: () => void;
  delay?: number;
}

const RoleCard = ({ role, isSelected, onClick, delay = 0 }: RoleCardProps) => {
  const Icon = role.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group relative w-full p-6 rounded-2xl text-left transition-all duration-300",
        "bg-card shadow-card hover:shadow-lg",
        "border-2",
        isSelected
          ? "border-primary shadow-glow"
          : "border-transparent hover:border-primary/20"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-6 h-6 rounded-full gradient-primary flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
          isSelected
            ? "gradient-primary text-primary-foreground"
            : "bg-primary/10 text-primary group-hover:bg-primary/20"
        )}
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-foreground mb-1">{role.title}</h3>
      <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
      <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
        {role.category}
      </span>
    </motion.button>
  );
};

export default RoleCard;
