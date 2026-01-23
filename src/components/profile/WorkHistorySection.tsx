import { Briefcase, Building2, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkHistoryItem } from "@/lib/linkedInImport";

interface WorkHistorySectionProps {
  workHistory: WorkHistoryItem[];
  maxItems?: number;
  compact?: boolean;
}

export function WorkHistorySection({ 
  workHistory, 
  maxItems = 5,
  compact = false 
}: WorkHistorySectionProps) {
  if (!workHistory || workHistory.length === 0) {
    return null;
  }

  const displayedItems = workHistory.slice(0, maxItems);
  const remainingCount = workHistory.length - maxItems;

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Experience
        </h4>
        <div className="space-y-2">
          {displayedItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-start gap-2 text-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{item.title}</p>
                <p className="text-muted-foreground text-xs truncate">
                  {item.company}
                  {item.duration && ` · ${item.duration}`}
                </p>
              </div>
            </div>
          ))}
          {remainingCount > 0 && (
            <p className="text-xs text-muted-foreground pl-3.5">
              +{remainingCount} more position{remainingCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Briefcase className="w-5 h-5 text-primary" />
          Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedItems.map((item, index) => (
          <div 
            key={index} 
            className="relative pl-6 pb-4 last:pb-0 border-l-2 border-muted last:border-transparent"
          >
            {/* Timeline dot */}
            <div className="absolute left-0 top-0 w-3 h-3 -translate-x-[7px] rounded-full bg-primary ring-4 ring-background" />
            
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground">{item.title}</h4>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {item.company}
                </span>
                
                {item.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.duration}
                  </span>
                )}
                
                {item.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {item.location}
                  </span>
                )}
              </div>
              
              {item.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="pl-6 pt-2 border-l-2 border-dashed border-muted">
            <Badge variant="secondary" className="text-xs">
              +{remainingCount} more position{remainingCount > 1 ? "s" : ""}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}