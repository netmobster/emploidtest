import { motion } from "framer-motion";
import { Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useInterviewAvailability } from "@/hooks/useInterviewAvailability";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

interface AvailabilityEditorProps {
  className?: string;
}

export function AvailabilityEditor({ className }: AvailabilityEditorProps) {
  const { slots, isLoading, isSaving, toggleSlot, hasSlot } =
    useInterviewAvailability();

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Interview Availability
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click to toggle 30-minute slots when you're available for interviews
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[600px] px-4 sm:px-0">
            {/* Day headers */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="text-xs text-muted-foreground font-medium p-1">
                Time
              </div>
              {DAYS.map((day, index) => (
                <div
                  key={day}
                  className={cn(
                    "text-xs font-medium text-center p-1",
                    index === 0 || index === 6
                      ? "text-muted-foreground"
                      : "text-foreground"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="space-y-1">
              {TIME_SLOTS.map((time) => (
                <div key={time} className="grid grid-cols-8 gap-1">
                  <div className="text-[10px] text-muted-foreground p-1 flex items-center">
                    {formatTime(time)}
                  </div>
                  {DAYS.map((_, dayIndex) => {
                    const isAvailable = hasSlot(dayIndex, time);
                    const isWeekend = dayIndex === 0 || dayIndex === 6;

                    return (
                      <motion.button
                        key={`${dayIndex}-${time}`}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleSlot(dayIndex, time)}
                        disabled={isSaving}
                        className={cn(
                          "h-6 rounded transition-all",
                          isAvailable
                            ? "bg-primary text-primary-foreground"
                            : isWeekend
                            ? "bg-muted/30 hover:bg-muted/50"
                            : "bg-muted/50 hover:bg-muted",
                          isSaving && "opacity-50 cursor-wait"
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-primary" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-muted/50" />
            <span>Not set</span>
          </div>
        </div>

        {/* Slot count */}
        <p className="text-xs text-muted-foreground mt-2">
          {slots.length} time slot{slots.length !== 1 ? "s" : ""} available
        </p>
      </CardContent>
    </Card>
  );
}
