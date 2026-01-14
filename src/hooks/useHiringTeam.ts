import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface HiringTeamMember {
  id: string;
  employer_id: string;
  name: string;
  title: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  email: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateHiringTeamMemberData {
  name: string;
  title?: string;
  avatar_url?: string;
  linkedin_url?: string;
  email?: string;
  is_primary?: boolean;
  display_order?: number;
}

export function useHiringTeam(employerId?: string) {
  const { user, profile } = useAuth();
  const [teamMembers, setTeamMembers] = useState<HiringTeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const targetEmployerId = employerId || user?.id;

  const fetchTeamMembers = useCallback(async () => {
    if (!targetEmployerId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("hiring_team_members")
        .select("*")
        .eq("employer_id", targetEmployerId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setTeamMembers((data as HiringTeamMember[]) || []);
    } catch (error) {
      console.error("Error fetching hiring team:", error);
    } finally {
      setIsLoading(false);
    }
  }, [targetEmployerId]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const createTeamMember = async (data: CreateHiringTeamMemberData) => {
    if (!user?.id) return null;

    try {
      const { data: newMember, error } = await supabase
        .from("hiring_team_members")
        .insert({
          employer_id: user.id,
          name: data.name,
          title: data.title || null,
          avatar_url: data.avatar_url || null,
          linkedin_url: data.linkedin_url || null,
          email: data.email || null,
          is_primary: data.is_primary || false,
          display_order: data.display_order || teamMembers.length,
        })
        .select()
        .single();

      if (error) throw error;

      setTeamMembers((prev) => [...prev, newMember as HiringTeamMember]);
      toast.success("Team member added successfully");
      return newMember as HiringTeamMember;
    } catch (error) {
      console.error("Error creating team member:", error);
      toast.error("Failed to add team member");
      return null;
    }
  };

  const updateTeamMember = async (id: string, data: Partial<CreateHiringTeamMemberData>) => {
    try {
      const { error } = await supabase
        .from("hiring_team_members")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      setTeamMembers((prev) =>
        prev.map((member) =>
          member.id === id ? { ...member, ...data } : member
        )
      );
      toast.success("Team member updated");
      return true;
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error("Failed to update team member");
      return false;
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from("hiring_team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTeamMembers((prev) => prev.filter((member) => member.id !== id));
      toast.success("Team member removed");
      return true;
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to remove team member");
      return false;
    }
  };

  const setPrimaryMember = async (id: string) => {
    try {
      // First, unset all as primary
      await supabase
        .from("hiring_team_members")
        .update({ is_primary: false })
        .eq("employer_id", user?.id);

      // Then set the selected one as primary
      const { error } = await supabase
        .from("hiring_team_members")
        .update({ is_primary: true })
        .eq("id", id);

      if (error) throw error;

      setTeamMembers((prev) =>
        prev.map((member) => ({
          ...member,
          is_primary: member.id === id,
        }))
      );
      toast.success("Primary contact updated");
      return true;
    } catch (error) {
      console.error("Error setting primary member:", error);
      toast.error("Failed to update primary contact");
      return false;
    }
  };

  const createDefaultMember = async () => {
    if (!user?.id || !profile || profile.user_type !== "employer") return null;

    // Check if team already has members
    if (teamMembers.length > 0) return teamMembers[0];

    const defaultMember = await createTeamMember({
      name: profile.full_name || "Hiring Manager",
      title: profile.job_title || "Hiring Manager",
      avatar_url: profile.avatar_url || undefined,
      linkedin_url: profile.linkedin_url || undefined,
      email: profile.email || undefined,
      is_primary: true,
      display_order: 0,
    });

    return defaultMember;
  };

  const getPrimaryMember = () => {
    return teamMembers.find((m) => m.is_primary) || teamMembers[0] || null;
  };

  return {
    teamMembers,
    isLoading,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    setPrimaryMember,
    createDefaultMember,
    getPrimaryMember,
    refetch: fetchTeamMembers,
  };
}
