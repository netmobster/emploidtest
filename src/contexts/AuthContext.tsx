import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  bio: string | null;
  user_type: "employer" | "candidate";
  culture_preferences: Record<string, string> | null;
  has_completed_culture_game: boolean;
  has_completed_profile: boolean;
  has_completed_extended_profile: boolean;
  has_completed_work_love_language: boolean;
  has_completed_manager_profile: boolean;
  has_completed_synergy_quiz: boolean;
  synergy_scores: Record<string, number> | null;
  company_website: string | null;
  company_size: string | null;
  company_industry: string | null;
  company_location: string | null;
  // Candidate extended profile fields
  linkedin_url: string | null;
  website_url: string | null;
  portfolio_url: string | null;
  skills: string[] | null;
  job_title: string | null;
  location: string | null;
  years_of_experience: string | null;
  availability: string | null;
  remote_preference: string | null;
  resume_url: string | null;
  cover_image_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, userType: "employer" | "candidate") => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const parseUserType = (value: unknown): "employer" | "candidate" | null => {
    return value === "employer" || value === "candidate" ? value : null;
  };

  const fetchOrCreateProfile = async (authUser: User) => {
    // First try to fetch
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch profile", error);
      return;
    }

    if (data) {
      setProfile(data as Profile);
      return;
    }

    // No profile yet: create one (common for OAuth first login if DB trigger isn't set up)
    const intendedType = parseUserType(localStorage.getItem("emploid_oauth_user_type"));
    const meta = (authUser.user_metadata || {}) as Record<string, unknown>;
    const fullName = (meta.full_name as string) || (meta.name as string) || null;
    const metaType = parseUserType(meta.user_type);

    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert({
        user_id: authUser.id,
        email: authUser.email ?? null,
        full_name: fullName,
        user_type: intendedType ?? metaType ?? "candidate",
      })
      .select("*")
      .single();

    // Clear the stored type so it doesn't affect future logins
    localStorage.removeItem("emploid_oauth_user_type");

    if (insertError) {
      // If it was created in a parallel request, just refetch
      if ((insertError as any)?.code === "23505") {
        const { data: refetched } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();
        if (refetched) setProfile(refetched as Profile);
        return;
      }

      console.error("Failed to create profile", insertError);
      return;
    }

    if (inserted) {
      setProfile(inserted as Profile);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchOrCreateProfile(session.user);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchOrCreateProfile(session.user);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userType: "employer" | "candidate") => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          user_type: userType,
        },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchOrCreateProfile(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}