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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_analyses: {
        Row: {
          created_at: string
          id: string
          instructor_id: string
          model: string
          prompt_version: string
          response_count: number
          result: Json
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructor_id: string
          model: string
          prompt_version?: string
          response_count: number
          result: Json
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instructor_id?: string
          model?: string
          prompt_version?: string
          response_count?: number
          result?: Json
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_analyses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analyses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "feedback_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          course_id: string
          instructor_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          course_id: string
          instructor_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          course_id?: string
          instructor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_assignments_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback_questions: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          options: Json | null
          position: number
          prompt: string
          session_id: string
          type: Database["public"]["Enums"]["feedback_question_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          options?: Json | null
          position: number
          prompt: string
          session_id: string
          type: Database["public"]["Enums"]["feedback_question_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          options?: Json | null
          position?: number
          prompt?: string
          session_id?: string
          type?: Database["public"]["Enums"]["feedback_question_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "feedback_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses: {
        Row: {
          id: string
          session_id: string
          submitted_at: string
        }
        Insert: {
          id?: string
          session_id: string
          submitted_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "feedback_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_sessions: {
        Row: {
          closes_at: string | null
          course_id: string
          created_at: string
          description: string | null
          expected_responses: number | null
          id: string
          instructor_id: string
          material_name: string | null
          material_path: string | null
          material_size: number | null
          minimum_analysis_responses: number
          opens_at: string | null
          slug: string
          status: Database["public"]["Enums"]["feedback_session_status"]
          title: string
          updated_at: string
        }
        Insert: {
          closes_at?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          expected_responses?: number | null
          id?: string
          instructor_id: string
          material_name?: string | null
          material_path?: string | null
          material_size?: number | null
          minimum_analysis_responses?: number
          opens_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["feedback_session_status"]
          title: string
          updated_at?: string
        }
        Update: {
          closes_at?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          expected_responses?: number | null
          id?: string
          instructor_id?: string
          material_name?: string | null
          material_path?: string | null
          material_size?: number | null
          minimum_analysis_responses?: number
          opens_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["feedback_session_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_sessions_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_reflections: {
        Row: {
          created_at: string
          id: string
          instructor_id: string
          next_steps: string
          perceived_challenges: string
          perceived_strengths: string
          session_id: string
          surprises: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructor_id: string
          next_steps: string
          perceived_challenges: string
          perceived_strengths: string
          session_id: string
          surprises: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instructor_id?: string
          next_steps?: string
          perceived_challenges?: string
          perceived_strengths?: string
          session_id?: string
          surprises?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructor_reflections_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructor_reflections_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "feedback_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department_id: string | null
          full_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          full_name: string
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      response_answers: {
        Row: {
          choice_value: string | null
          created_at: string
          id: string
          question_id: string
          rating_value: number | null
          response_id: string
          text_value: string | null
        }
        Insert: {
          choice_value?: string | null
          created_at?: string
          id?: string
          question_id: string
          rating_value?: number | null
          response_id: string
          text_value?: string | null
        }
        Update: {
          choice_value?: string | null
          created_at?: string
          id?: string
          question_id?: string
          rating_value?: number | null
          response_id?: string
          text_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "response_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "feedback_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "feedback_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      response_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          response_id: string | null
          session_id: string
          used_at: string | null
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          response_id?: string | null
          session_id: string
          used_at?: string | null
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          response_id?: string | null
          session_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "response_codes_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "feedback_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_codes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "feedback_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_rate_limits: {
        Row: {
          key_hash: string
          request_count: number
          window_start: string
        }
        Insert: {
          key_hash: string
          request_count?: number
          window_start: string
        }
        Update: {
          key_hash?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_submission_rate_limit: {
        Args: {
          maximum_requests: number
          target_key_hash: string
          target_window: string
        }
        Returns: boolean
      }
      create_course_with_assignments: {
        Args: {
          course_code: string
          course_department_id: string
          course_description: string
          course_name: string
          target_instructor_ids: string[]
        }
        Returns: string
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_dashboard_overview: { Args: never; Returns: Json }
      get_public_session: { Args: { target_slug: string }; Returns: Json }
      get_session_statistics: {
        Args: { target_session_id: string }
        Returns: Json
      }
      is_active_user: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_assigned_to_course: {
        Args: { target_course_id: string }
        Returns: boolean
      }
      owns_session: { Args: { target_session_id: string }; Returns: boolean }
      submit_anonymous_feedback: {
        Args: {
          submitted_answers: Json
          submitted_code_hash: string
          target_slug: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "instructor" | "admin"
      feedback_question_type: "rating" | "single_choice" | "long_text"
      feedback_session_status: "draft" | "open" | "closed" | "analyzed"
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
      app_role: ["instructor", "admin"],
      feedback_question_type: ["rating", "single_choice", "long_text"],
      feedback_session_status: ["draft", "open", "closed", "analyzed"],
    },
  },
} as const

