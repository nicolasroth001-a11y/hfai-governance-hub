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
      ai_events: {
        Row: {
          ai_system_id: string | null
          created_at: string
          event_type: string
          id: string
          input_text: string | null
          metadata: Json | null
          org_id: string
          output_text: string | null
          payload: Json | null
        }
        Insert: {
          ai_system_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          input_text?: string | null
          metadata?: Json | null
          org_id: string
          output_text?: string | null
          payload?: Json | null
        }
        Update: {
          ai_system_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          input_text?: string | null
          metadata?: Json | null
          org_id?: string
          output_text?: string | null
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_events_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_systems: {
        Row: {
          created_at: string
          data_governance_notes: string | null
          description: string | null
          eu_risk_tier: string | null
          id: string
          model_type: string | null
          name: string
          org_id: string
          owner_team: string | null
          provider: string | null
          risk_level: string | null
          status: string | null
          transparency_uri: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          created_at?: string
          data_governance_notes?: string | null
          description?: string | null
          eu_risk_tier?: string | null
          id?: string
          model_type?: string | null
          name: string
          org_id: string
          owner_team?: string | null
          provider?: string | null
          risk_level?: string | null
          status?: string | null
          transparency_uri?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string
          data_governance_notes?: string | null
          description?: string | null
          eu_risk_tier?: string | null
          id?: string
          model_type?: string | null
          name?: string
          org_id?: string
          owner_team?: string | null
          provider?: string | null
          risk_level?: string | null
          status?: string | null
          transparency_uri?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_systems_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics: {
        Row: {
          created_at: string
          id: string
          referrer: string | null
          route: string
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referrer?: string | null
          route: string
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referrer?: string | null
          route?: string
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          org_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          org_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          org_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_providers: {
        Row: {
          api_key_encrypted: string
          base_url: string | null
          created_at: string
          id: string
          org_id: string
          provider: string
          proxy_token: string
          status: string
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted: string
          base_url?: string | null
          created_at?: string
          id?: string
          org_id: string
          provider?: string
          proxy_token?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string
          base_url?: string | null
          created_at?: string
          id?: string
          org_id?: string
          provider?: string
          proxy_token?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connected_providers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      human_reviews: {
        Row: {
          comments: string | null
          created_at: string
          decision: string | null
          id: string
          reviewer_id: string | null
          reviewer_name: string | null
          violation_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          decision?: string | null
          id?: string
          reviewer_id?: string | null
          reviewer_name?: string | null
          violation_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          decision?: string | null
          id?: string
          reviewer_id?: string | null
          reviewer_name?: string | null
          violation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "human_reviews_violation_id_fkey"
            columns: ["violation_id"]
            isOneToOne: false
            referencedRelation: "violations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          channel: string
          created_at: string
          error: string | null
          id: string
          org_id: string
          recipients: string[]
          status: string
          subject: string | null
          violation_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          error?: string | null
          id?: string
          org_id: string
          recipients?: string[]
          status?: string
          subject?: string | null
          violation_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          error?: string | null
          id?: string
          org_id?: string
          recipients?: string[]
          status?: string
          subject?: string | null
          violation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_violation_id_fkey"
            columns: ["violation_id"]
            isOneToOne: false
            referencedRelation: "violations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          email_recipients: string[]
          id: string
          notify_all_violations: boolean
          notify_high_severity: boolean
          notify_patterns: boolean
          org_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          email_recipients?: string[]
          id?: string
          notify_all_violations?: boolean
          notify_high_severity?: boolean
          notify_patterns?: boolean
          org_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          email_recipients?: string[]
          id?: string
          notify_all_violations?: boolean
          notify_high_severity?: boolean
          notify_patterns?: boolean
          org_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          api_key: string | null
          contact_email: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          api_key?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          api_key?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          org_id: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      remediation_actions: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          org_id: string
          rca_id: string
          status: string | null
          title: string
          updated_at: string | null
          violation_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          org_id: string
          rca_id: string
          status?: string | null
          title: string
          updated_at?: string | null
          violation_id: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          org_id?: string
          rca_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          violation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "remediation_actions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remediation_actions_rca_id_fkey"
            columns: ["rca_id"]
            isOneToOne: false
            referencedRelation: "root_cause_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remediation_actions_violation_id_fkey"
            columns: ["violation_id"]
            isOneToOne: false
            referencedRelation: "violations"
            referencedColumns: ["id"]
          },
        ]
      }
      root_cause_analyses: {
        Row: {
          ai_diagnosis: string | null
          ai_recommendations: string | null
          ai_suggested_rules: Json | null
          analyzed_by: string | null
          created_at: string
          human_diagnosis: string | null
          human_notes: string | null
          id: string
          org_id: string
          status: string | null
          updated_at: string | null
          violation_id: string
        }
        Insert: {
          ai_diagnosis?: string | null
          ai_recommendations?: string | null
          ai_suggested_rules?: Json | null
          analyzed_by?: string | null
          created_at?: string
          human_diagnosis?: string | null
          human_notes?: string | null
          id?: string
          org_id: string
          status?: string | null
          updated_at?: string | null
          violation_id: string
        }
        Update: {
          ai_diagnosis?: string | null
          ai_recommendations?: string | null
          ai_suggested_rules?: Json | null
          analyzed_by?: string | null
          created_at?: string
          human_diagnosis?: string | null
          human_notes?: string | null
          id?: string
          org_id?: string
          status?: string | null
          updated_at?: string | null
          violation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "root_cause_analyses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "root_cause_analyses_violation_id_fkey"
            columns: ["violation_id"]
            isOneToOne: false
            referencedRelation: "violations"
            referencedColumns: ["id"]
          },
        ]
      }
      rules: {
        Row: {
          category: string | null
          condition: string | null
          created_at: string
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          org_id: string | null
          severity: string | null
        }
        Insert: {
          category?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          org_id?: string | null
          severity?: string | null
        }
        Update: {
          category?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          org_id?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      violation_patterns: {
        Row: {
          created_at: string
          description: string | null
          first_seen: string | null
          frequency: number | null
          id: string
          last_seen: string | null
          org_id: string | null
          pattern_name: string
          rule_ids: string[] | null
          status: string | null
          violation_ids: string[] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          first_seen?: string | null
          frequency?: number | null
          id?: string
          last_seen?: string | null
          org_id?: string | null
          pattern_name: string
          rule_ids?: string[] | null
          status?: string | null
          violation_ids?: string[] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          first_seen?: string | null
          frequency?: number | null
          id?: string
          last_seen?: string | null
          org_id?: string | null
          pattern_name?: string
          rule_ids?: string[] | null
          status?: string | null
          violation_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "violation_patterns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      violations: {
        Row: {
          ai_event_id: string | null
          ai_system_id: string | null
          assigned_reviewer_id: string | null
          created_at: string
          description: string | null
          detected_at: string | null
          id: string
          org_id: string
          resolution_notes: string | null
          rule_id: string | null
          severity: string | null
          status: string | null
        }
        Insert: {
          ai_event_id?: string | null
          ai_system_id?: string | null
          assigned_reviewer_id?: string | null
          created_at?: string
          description?: string | null
          detected_at?: string | null
          id?: string
          org_id: string
          resolution_notes?: string | null
          rule_id?: string | null
          severity?: string | null
          status?: string | null
        }
        Update: {
          ai_event_id?: string | null
          ai_system_id?: string | null
          assigned_reviewer_id?: string | null
          created_at?: string
          description?: string | null
          detected_at?: string | null
          id?: string
          org_id?: string
          resolution_notes?: string | null
          rule_id?: string | null
          severity?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "violations_ai_event_id_fkey"
            columns: ["ai_event_id"]
            isOneToOne: false
            referencedRelation: "ai_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "violations_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "violations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "violations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "reviewer" | "customer"
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
      app_role: ["admin", "reviewer", "customer"],
    },
  },
} as const
