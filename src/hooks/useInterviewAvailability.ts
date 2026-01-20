import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

export function useInterviewAvailability(employerId?: string) {
  const { user, profile } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const targetEmployerId = employerId || user?.id;
  const isOwner = user?.id === targetEmployerId;

  const fetchSlots = useCallback(async () => {
    if (!targetEmployerId) {
      setSlots([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("interview_availability")
        .select("*")
        .eq("employer_id", targetEmployerId)
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;

      setSlots(data || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setIsLoading(false);
    }
  }, [targetEmployerId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const addSlot = useCallback(
    async (dayOfWeek: number, startTime: string, endTime: string) => {
      if (!user || !isOwner) return null;

      setIsSaving(true);
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const { data, error } = await supabase
          .from("interview_availability")
          .insert({
            employer_id: user.id,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            timezone,
          })
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            toast.error("This time slot already exists");
          } else {
            throw error;
          }
          return null;
        }

        setSlots((prev) => [...prev, data]);
        toast.success("Availability added");
        return data;
      } catch (error) {
        console.error("Error adding slot:", error);
        toast.error("Failed to add availability");
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [user, isOwner]
  );

  const removeSlot = useCallback(
    async (slotId: string) => {
      if (!user || !isOwner) return false;

      setIsSaving(true);
      try {
        const { error } = await supabase
          .from("interview_availability")
          .delete()
          .eq("id", slotId);

        if (error) throw error;

        setSlots((prev) => prev.filter((s) => s.id !== slotId));
        toast.success("Availability removed");
        return true;
      } catch (error) {
        console.error("Error removing slot:", error);
        toast.error("Failed to remove availability");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [user, isOwner]
  );

  const toggleSlot = useCallback(
    async (dayOfWeek: number, startTime: string) => {
      const existingSlot = slots.find(
        (s) => s.day_of_week === dayOfWeek && s.start_time === startTime
      );

      if (existingSlot) {
        return removeSlot(existingSlot.id);
      } else {
        // Default to 30-minute slots
        const [hours, minutes] = startTime.split(":").map(Number);
        const endDate = new Date();
        endDate.setHours(hours, minutes + 30);
        const endTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(
          endDate.getMinutes()
        ).padStart(2, "0")}`;

        const result = await addSlot(dayOfWeek, startTime, endTime);
        return !!result;
      }
    },
    [slots, addSlot, removeSlot]
  );

  const hasSlot = useCallback(
    (dayOfWeek: number, startTime: string) => {
      return slots.some(
        (s) => s.day_of_week === dayOfWeek && s.start_time === startTime
      );
    },
    [slots]
  );

  return {
    slots,
    isLoading,
    isSaving,
    addSlot,
    removeSlot,
    toggleSlot,
    hasSlot,
    refresh: fetchSlots,
    isOwner,
  };
}
