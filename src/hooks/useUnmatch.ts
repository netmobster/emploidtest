import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUnmatch = () => {
  const [isUnmatching, setIsUnmatching] = useState(false);

  const unmatch = async (matchId: string): Promise<boolean> => {
    setIsUnmatching(true);
    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: "unmatched" })
        .eq("id", matchId);

      if (error) throw error;

      toast.success("Successfully unmatched");
      return true;
    } catch (error) {
      console.error("Error unmatching:", error);
      toast.error("Failed to unmatch");
      return false;
    } finally {
      setIsUnmatching(false);
    }
  };

  return { unmatch, isUnmatching };
};
