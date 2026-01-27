import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RoleDefinition {
  id: string;
  title: string;
  company: string;
  pay_min: number | null;
  pay_max: number | null;
  work_mode: "remote" | "hybrid" | "on-site";
  location_text: string | null;
  reporting_to: string | null;
  mission_statement: string | null;
  big_rocks: string[];
  daily_stack: string[];
  vibe_mode: "async-autonomous" | "high-collaboration";
  is_complete: boolean;
}

interface UpdateRoleData {
  pay_min?: number | null;
  pay_max?: number | null;
  work_mode?: "remote" | "hybrid" | "on-site";
  location_text?: string | null;
  reporting_to?: string | null;
  mission_statement?: string | null;
  big_rocks?: string[];
  daily_stack?: string[];
  vibe_mode?: "async-autonomous" | "high-collaboration";
  is_complete?: boolean;
}

export function useRoleDefinition(jobId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRole = useCallback(async (): Promise<RoleDefinition | null> => {
    if (!jobId) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, company, pay_min, pay_max, work_mode, location_text, reporting_to, mission_statement, big_rocks, daily_stack, vibe_mode, is_complete")
        .eq("id", jobId)
        .single();

      if (error) throw error;

      return {
        ...data,
        company: data.company || "Company",
        work_mode: (data.work_mode as "remote" | "hybrid" | "on-site") || "remote",
        vibe_mode: (data.vibe_mode as "async-autonomous" | "high-collaboration") || "async-autonomous",
        big_rocks: Array.isArray(data.big_rocks) ? data.big_rocks : [],
        daily_stack: data.daily_stack || [],
        is_complete: data.is_complete || false,
      } as RoleDefinition;
    } catch (error) {
      console.error("Error fetching role:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  const updateRole = useCallback(async (updates: UpdateRoleData): Promise<boolean> => {
    if (!jobId) return false;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update(updates)
        .eq("id", jobId);

      if (error) throw error;
      
      toast.success("Role details saved");
      return true;
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to save role details");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [jobId]);

  const publishRole = useCallback(async (roleData: UpdateRoleData): Promise<boolean> => {
    if (!jobId) return false;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({
          ...roleData,
          is_complete: true,
        })
        .eq("id", jobId);

      if (error) throw error;
      
      toast.success("Role published! Chat is now unlocked.");
      return true;
    } catch (error) {
      console.error("Error publishing role:", error);
      toast.error("Failed to publish role");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [jobId]);

  const generateMissionStatement = useCallback(async (title: string, skills: string[]): Promise<string | null> => {
    try {
      const prompt = `Generate a concise 1-2 sentence mission statement for a ${title} role. 
${skills.length > 0 ? `Key skills: ${skills.join(", ")}` : ""}
The mission should be inspiring, specific, and outcome-oriented. Focus on impact, not tasks.
Return only the mission statement, no quotes or extra text.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 150,
        }),
      });

      if (!response.ok) throw new Error("AI request failed");
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (error) {
      console.error("Error generating mission:", error);
      toast.error("Failed to generate mission statement");
      return null;
    }
  }, []);

  return {
    isLoading,
    isSaving,
    fetchRole,
    updateRole,
    publishRole,
    generateMissionStatement,
  };
}
