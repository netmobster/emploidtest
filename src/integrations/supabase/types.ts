export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      chat_card_preferences: {
        Row: {
          created_at: string
          display_order: number | null
          employer_id: string
          field_key: string
          id: string
          is_pinned: boolean | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          employer_id: string
          field_key: string
          id?: string
          is_pinned?: boolean | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          employer_id?: string
          field_key?: string
          id?: string
          is_pinned?: boolean | null
        }
        Relationships: []
      }
      custom_pack_questions: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          pack_id: string
          question_text: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          pack_id: string
          question_text: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          pack_id?: string
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_pack_questions_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "custom_question_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_question_packs: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          employer_id: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          employer_id: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          employer_id?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_requests: {
        Row: {
          created_at: string
          custom_label: string | null
          document_type: string
          file_url: string | null
          id: string
          match_id: string
          notes: string | null
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_label?: string | null
          document_type: string
          file_url?: string | null
          id?: string
          match_id: string
          notes?: string | null
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_label?: string | null
          document_type?: string
          file_url?: string | null
          id?: string
          match_id?: string
          notes?: string | null
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_requests_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      hiring_team_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_order: number | null
          email: string | null
          employer_id: string
          id: string
          is_primary: boolean | null
          linkedin_url: string | null
          name: string
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_order?: number | null
          email?: string | null
          employer_id: string
          id?: string
          is_primary?: boolean | null
          linkedin_url?: string | null
          name: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_order?: number | null
          email?: string | null
          employer_id?: string
          id?: string
          is_primary?: boolean | null
          linkedin_url?: string | null
          name?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      internal_notes: {
        Row: {
          content: string
          created_at: string
          employer_id: string
          id: string
          match_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          employer_id: string
          id?: string
          match_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          employer_id?: string
          id?: string
          match_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_notes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          employer_id: string
          end_time: string
          id: string
          start_time: string
          timezone: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          employer_id: string
          end_time: string
          id?: string
          start_time: string
          timezone?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          employer_id?: string
          end_time?: string
          id?: string
          start_time?: string
          timezone?: string | null
        }
        Relationships: []
      }
      interview_insights: {
        Row: {
          candidate_id: string
          completed_at: string
          created_at: string
          employer_id: string
          id: string
          match_id: string
          questions: Json
          responses: Json
        }
        Insert: {
          candidate_id: string
          completed_at?: string
          created_at?: string
          employer_id: string
          id?: string
          match_id: string
          questions: Json
          responses: Json
        }
        Update: {
          candidate_id?: string
          completed_at?: string
          created_at?: string
          employer_id?: string
          id?: string
          match_id?: string
          questions?: Json
          responses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "interview_insights_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          candidate_id: string
          created_at: string | null
          created_by: string
          duration_minutes: number | null
          employer_id: string
          id: string
          job_id: string | null
          match_id: string | null
          meeting_link: string | null
          notes: string | null
          scheduled_at: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          created_by: string
          duration_minutes?: number | null
          employer_id: string
          id?: string
          job_id?: string | null
          match_id?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          created_by?: string
          duration_minutes?: number | null
          employer_id?: string
          id?: string
          job_id?: string | null
          match_id?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_at: string | null
          created_at: string
          id: string
          job_id: string
          match_id: string | null
          notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          id?: string
          job_id: string
          match_id?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          id?: string
          job_id?: string
          match_id?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string[] | null
          big_rocks: Json | null
          city_id: string
          company: string
          created_at: string
          culture_preferences: Json | null
          daily_stack: string[] | null
          description: string | null
          geographic_restriction: string | null
          hiring_manager_id: string | null
          id: string
          is_complete: boolean | null
          location_text: string | null
          mission_statement: string | null
          pay_max: number | null
          pay_min: number | null
          remote: boolean | null
          reporting_to: string | null
          requirements: string[] | null
          role_id: string
          salary: string | null
          skills_preferences: Json | null
          title: string
          type: string | null
          user_id: string | null
          vibe_mode: string | null
          work_mode: string | null
        }
        Insert: {
          benefits?: string[] | null
          big_rocks?: Json | null
          city_id: string
          company: string
          created_at?: string
          culture_preferences?: Json | null
          daily_stack?: string[] | null
          description?: string | null
          geographic_restriction?: string | null
          hiring_manager_id?: string | null
          id?: string
          is_complete?: boolean | null
          location_text?: string | null
          mission_statement?: string | null
          pay_max?: number | null
          pay_min?: number | null
          remote?: boolean | null
          reporting_to?: string | null
          requirements?: string[] | null
          role_id: string
          salary?: string | null
          skills_preferences?: Json | null
          title: string
          type?: string | null
          user_id?: string | null
          vibe_mode?: string | null
          work_mode?: string | null
        }
        Update: {
          benefits?: string[] | null
          big_rocks?: Json | null
          city_id?: string
          company?: string
          created_at?: string
          culture_preferences?: Json | null
          daily_stack?: string[] | null
          description?: string | null
          geographic_restriction?: string | null
          hiring_manager_id?: string | null
          id?: string
          is_complete?: boolean | null
          location_text?: string | null
          mission_statement?: string | null
          pay_max?: number | null
          pay_min?: number | null
          remote?: boolean | null
          reporting_to?: string | null
          requirements?: string[] | null
          role_id?: string
          salary?: string | null
          skills_preferences?: Json | null
          title?: string
          type?: string | null
          user_id?: string | null
          vibe_mode?: string | null
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_hiring_manager_id_fkey"
            columns: ["hiring_manager_id"]
            isOneToOne: false
            referencedRelation: "hiring_team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          candidate_id: string
          employer_id: string
          first_message_sent: boolean | null
          id: string
          job_id: string | null
          matched_at: string
          status: string | null
        }
        Insert: {
          candidate_id: string
          employer_id: string
          first_message_sent?: boolean | null
          id?: string
          job_id?: string | null
          matched_at?: string
          status?: string | null
        }
        Update: {
          candidate_id?: string
          employer_id?: string
          first_message_sent?: boolean | null
          id?: string
          job_id?: string | null
          matched_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          data: Json | null
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability: string | null
          avatar_url: string | null
          bio: string | null
          calendly_url: string | null
          city_hub: string | null
          company_industry: string | null
          company_location: string | null
          company_name: string | null
          company_size: string | null
          company_website: string | null
          cover_image_url: string | null
          created_at: string
          culture_preferences: Json | null
          email: string | null
          email_notifications_enabled: boolean | null
          full_name: string | null
          geographic_restriction: string | null
          has_completed_culture_game: boolean | null
          has_completed_extended_profile: boolean | null
          has_completed_manager_profile: boolean | null
          has_completed_profile: boolean | null
          has_completed_synergy_quiz: boolean | null
          has_completed_work_love_language: boolean | null
          id: string
          job_title: string | null
          last_login_at: string | null
          linkedin_synced_at: string | null
          linkedin_url: string | null
          location: string | null
          location_tier: string | null
          portfolio_url: string | null
          previous_login_at: string | null
          remote_preference: string | null
          resume_url: string | null
          skills: string[] | null
          synergy_scores: Json | null
          updated_at: string
          user_id: string
          user_type: string
          website_url: string | null
          work_history: Json | null
          work_mode: string | null
          years_of_experience: string | null
        }
        Insert: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          calendly_url?: string | null
          city_hub?: string | null
          company_industry?: string | null
          company_location?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          cover_image_url?: string | null
          created_at?: string
          culture_preferences?: Json | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          geographic_restriction?: string | null
          has_completed_culture_game?: boolean | null
          has_completed_extended_profile?: boolean | null
          has_completed_manager_profile?: boolean | null
          has_completed_profile?: boolean | null
          has_completed_synergy_quiz?: boolean | null
          has_completed_work_love_language?: boolean | null
          id?: string
          job_title?: string | null
          last_login_at?: string | null
          linkedin_synced_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          location_tier?: string | null
          portfolio_url?: string | null
          previous_login_at?: string | null
          remote_preference?: string | null
          resume_url?: string | null
          skills?: string[] | null
          synergy_scores?: Json | null
          updated_at?: string
          user_id: string
          user_type?: string
          website_url?: string | null
          work_history?: Json | null
          work_mode?: string | null
          years_of_experience?: string | null
        }
        Update: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          calendly_url?: string | null
          city_hub?: string | null
          company_industry?: string | null
          company_location?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          cover_image_url?: string | null
          created_at?: string
          culture_preferences?: Json | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          geographic_restriction?: string | null
          has_completed_culture_game?: boolean | null
          has_completed_extended_profile?: boolean | null
          has_completed_manager_profile?: boolean | null
          has_completed_profile?: boolean | null
          has_completed_synergy_quiz?: boolean | null
          has_completed_work_love_language?: boolean | null
          id?: string
          job_title?: string | null
          last_login_at?: string | null
          linkedin_synced_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          location_tier?: string | null
          portfolio_url?: string | null
          previous_login_at?: string | null
          remote_preference?: string | null
          resume_url?: string | null
          skills?: string[] | null
          synergy_scores?: Json | null
          updated_at?: string
          user_id?: string
          user_type?: string
          website_url?: string | null
          work_history?: Json | null
          work_mode?: string | null
          years_of_experience?: string | null
        }
        Relationships: []
      }
      quick_question_templates: {
        Row: {
          created_at: string
          display_order: number | null
          employer_id: string | null
          id: string
          is_default: boolean | null
          question_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          employer_id?: string | null
          id?: string
          is_default?: boolean | null
          question_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          employer_id?: string | null
          id?: string
          is_default?: boolean | null
          question_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_analytics: {
        Row: {
          candidate_id: string
          completed_at: string | null
          created_at: string
          employer_id: string
          id: string
          is_custom_pack: boolean | null
          pack_id: string
          questions_answered: number | null
          questions_sent: number
          quiz_request_id: string
          response_time_seconds: number | null
        }
        Insert: {
          candidate_id: string
          completed_at?: string | null
          created_at?: string
          employer_id: string
          id?: string
          is_custom_pack?: boolean | null
          pack_id: string
          questions_answered?: number | null
          questions_sent?: number
          quiz_request_id: string
          response_time_seconds?: number | null
        }
        Update: {
          candidate_id?: string
          completed_at?: string | null
          created_at?: string
          employer_id?: string
          id?: string
          is_custom_pack?: boolean | null
          pack_id?: string
          questions_answered?: number | null
          questions_sent?: number
          quiz_request_id?: string
          response_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_analytics_quiz_request_id_fkey"
            columns: ["quiz_request_id"]
            isOneToOne: false
            referencedRelation: "quiz_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_requests: {
        Row: {
          candidate_id: string
          created_at: string
          employer_id: string
          employer_name: string
          id: string
          match_id: string
          questions: Json
          status: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          employer_id: string
          employer_name: string
          id?: string
          match_id: string
          questions: Json
          status?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          employer_id?: string
          employer_name?: string
          id?: string
          match_id?: string
          questions?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_requests_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      shortlists: {
        Row: {
          candidate_id: string
          created_at: string
          employer_id: string
          id: string
          job_id: string
          notes: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          employer_id: string
          id?: string
          job_id: string
          notes?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          employer_id?: string
          id?: string
          job_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shortlists_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          created_at: string
          direction: string
          id: string
          job_id: string | null
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          created_at?: string
          direction: string
          id?: string
          job_id?: string | null
          swiped_id: string
          swiper_id: string
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          job_id?: string | null
          swiped_id?: string
          swiper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "moderator", "user"],
    },
  },
} as const
