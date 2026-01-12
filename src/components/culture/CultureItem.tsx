import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CultureItemProps {
  label: string;
  value: string;
  icon: LucideIcon;
  colorClass?: string;
}

export function CultureItem({ label, value, icon: Icon, colorClass }: CultureItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <div className={cn("p-2 rounded-lg bg-background", colorClass)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <Badge variant="outline" className="mt-1 text-xs font-normal max-w-full truncate">
          {value}
        </Badge>
      </div>
    </div>
  );
}
