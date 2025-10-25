export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      dates: {
        Row: {
          additional_info: Json | null
          description: string | null
          end_time: string
          id: string
          start_time: string
          status: Database["public"]["Enums"]["date_status"]
          student_id: string | null
          teacher_id: string
          title: string | null
        }
        Insert: {
          additional_info?: Json | null
          description?: string | null
          end_time: string
          id?: string
          start_time: string
          status?: Database["public"]["Enums"]["date_status"]
          student_id?: string | null
          teacher_id: string
          title?: string | null
        }
        Update: {
          additional_info?: Json | null
          description?: string | null
          end_time?: string
          id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["date_status"]
          student_id?: string | null
          teacher_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dates_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          details: string | null
          error_code: string | null
          function_name: string | null
          id: number
          module: string | null
          occurred_at: string
        }
        Insert: {
          details?: string | null
          error_code?: string | null
          function_name?: string | null
          id?: number
          module?: string | null
          occurred_at?: string
        }
        Update: {
          details?: string | null
          error_code?: string | null
          function_name?: string | null
          id?: number
          module?: string | null
          occurred_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          duration_minutes: number
          id: string
          reservation_id: string
          scheduled_at: string
          status: Database["public"]["Enums"]["lesson_status"]
          student_id: string
          teacher_id: string
        }
        Insert: {
          duration_minutes: number
          id?: string
          reservation_id: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["lesson_status"]
          student_id: string
          teacher_id: string
        }
        Update: {
          duration_minutes?: number
          id?: string
          reservation_id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["lesson_status"]
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          id: string
          notes: string | null
          reserved_at: string
          status: Database["public"]["Enums"]["reservation_status"]
          student_id: string
          term_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          reserved_at?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          student_id: string
          term_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          reserved_at?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          student_id?: string
          term_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: true
            referencedRelation: "dates"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_students: {
        Row: {
          lessons_completed: number
          lessons_reserved: number
          student_id: string
          teacher_id: string
        }
        Insert: {
          lessons_completed?: number
          lessons_reserved?: number
          student_id: string
          teacher_id: string
        }
        Update: {
          lessons_completed?: number
          lessons_reserved?: number
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_teacher"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          bio: string | null
          description: string | null
          lessons_completed: number
          lessons_planned: number
          teacher_id: string
        }
        Insert: {
          bio?: string | null
          description?: string | null
          lessons_completed?: number
          lessons_planned?: number
          teacher_id: string
        }
        Update: {
          bio?: string | null
          description?: string | null
          lessons_completed?: number
          lessons_planned?: number
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          first_name: string
          id: string
          last_login_at: string | null
          last_name: string
          metadata: Json | null
          profile_created_at: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          first_name: string
          id: string
          last_login_at?: string | null
          last_name: string
          metadata?: Json | null
          profile_created_at?: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          first_name?: string
          id?: string
          last_login_at?: string | null
          last_name?: string
          metadata?: Json | null
          profile_created_at?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_teacher_stats: {
        Args: { p_teacher_id: string }
        Returns: {
          total_lessons_completed: number
          total_lessons_reserved: number
          total_students: number
        }[]
      }
      get_user_email: {
        Args: { user_id: string }
        Returns: string
      }
      increment_lessons_completed: {
        Args: { p_student_id: string; p_teacher_id: string }
        Returns: undefined
      }
      increment_lessons_reserved: {
        Args: { p_student_id: string; p_teacher_id: string }
        Returns: undefined
      }
      recalculate_teacher_students_stats: {
        Args: { p_teacher_id: string; p_student_id?: string }
        Returns: undefined
      }
      sync_teacher_students_on_lesson_status_change: {
        Args: { 
          p_teacher_id: string
          p_student_id: string
          p_old_status: string | null
          p_new_status: string | null
        }
        Returns: undefined
      }
    }
    Enums: {
      date_status: "available" | "booked" | "canceled" | "other"
      lesson_status: "planned" | "completed" | "canceled"
      reservation_status: "confirmed" | "canceled" | "completed"
      user_role: "tutor" | "student"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      date_status: ["available", "booked", "canceled", "other"],
      lesson_status: ["planned", "completed", "canceled"],
      reservation_status: ["confirmed", "canceled", "completed"],
      user_role: ["tutor", "student"],
    },
  },
} as const

