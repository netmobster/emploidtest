import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useInterviewAvailability, AvailabilitySlot } from "@/hooks/useInterviewAvailability";
import { useInterviews } from "@/hooks/useInterviews";

interface InterviewSchedulerProps {
  matchId: string;
  jobId?: string;
  employerId: string;
  candidateId: string;
  onScheduled?: () => void;
}

export function InterviewScheduler({
  matchId,
  jobId,
  employerId,
  candidateId,
  onScheduled,
}: InterviewSchedulerProps) {
  const { slots, isLoading: loadingSlots } = useInterviewAvailability(employerId);
  const { scheduleInterview } = useInterviews(matchId);

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Group slots by day of week
  const slotsByDay = useMemo(() => {
    const grouped: Record<number, AvailabilitySlot[]> = {};
    slots.forEach((slot) => {
      if (!grouped[slot.day_of_week]) {
        grouped[slot.day_of_week] = [];
      }
      grouped[slot.day_of_week].push(slot);
    });
    return grouped;
  }, [slots]);

  // Get available times for selected date
  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    const daySlots = slotsByDay[dayOfWeek] || [];
    return daySlots.map((s) => s.start_time).sort();
  }, [selectedDate, slotsByDay]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      await scheduleInterview({
        matchId,
        jobId,
        employerId,
        candidateId,
        scheduledAt,
        notes,
      });

      setIsConfirmOpen(false);
      setSelectedDate(null);
      setSelectedTime(null);
      setNotes("");
      onScheduled?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSlots) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            No interview slots available yet
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            The employer hasn't set their availability
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule Interview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Week navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset((w) => w - 1)}
              disabled={weekOffset === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset((w) => w + 1)}
              disabled={weekOffset >= 3}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day selector */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((date) => {
              const dayOfWeek = date.getDay();
              const hasSlots = slotsByDay[dayOfWeek]?.length > 0;
              const isPast = date < new Date();
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => hasSlots && !isPast && handleDateSelect(date)}
                  disabled={!hasSlots || isPast}
                  className={cn(
                    "p-2 rounded-lg text-center transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : hasSlots && !isPast
                      ? "bg-primary/10 hover:bg-primary/20 text-foreground"
                      : "bg-muted/30 text-muted-foreground cursor-not-allowed",
                    isToday && !isSelected && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <div className="text-[10px] font-medium">
                    {format(date, "EEE")}
                  </div>
                  <div className="text-sm font-bold">{format(date, "d")}</div>
                </button>
              );
            })}
          </div>

          {/* Time slots */}
          <AnimatePresence mode="wait">
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Available times for {format(selectedDate, "EEEE, MMM d")}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTimeSelect(time)}
                      className="text-xs"
                    >
                      {formatTime(time)}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Interview</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {selectedTime && formatTime(selectedTime)} (30 min)
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Add a note (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any topics you'd like to discuss..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Video className="w-4 h-4 mr-2" />
              )}
              Request Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
