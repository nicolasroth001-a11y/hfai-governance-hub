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
      ai_system_versions: {
        Row: {
          ai_system_id: string
          approved_at: string | null
          approved_by: string | null
          change_description: string | null
          changed_by: string | null
          created_at: string
          id: string
          new_values: Json | null
          org_id: string
          previous_values: Json | null
          version_label: string
        }
        Insert: {
          ai_system_id: string
          approved_at?: string | null
          approved_by?: string | null
          change_description?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_values?: Json | null
          org_id: string
          previous_values?: Json | null
          version_label?: string
        }
        Update: {
          ai_system_id?: string
          approved_at?: string | null
          approved_by?: string | null
          change_description?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_values?: Json | null
          org_id?: string
          previous_values?: Json | null
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_system_versions_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_system_versions_org_id_fkey"
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
      assessment_results: {
        Row: {
          answers: Json | null
          assessment_type: string
          category_scores: Json | null
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          max_score: number
          referrer: string | null
          score: number
          score_percentage: number | null
          user_agent: string | null
        }
        Insert: {
          answers?: Json | null
          assessment_type?: string
          category_scores?: Json | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          max_score?: number
          referrer?: string | null
          score?: number
          score_percentage?: number | null
          user_agent?: string | null
        }
        Update: {
          answers?: Json | null
          assessment_type?: string
          category_scores?: Json | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          max_score?: number
          referrer?: string | null
          score?: number
          score_percentage?: number | null
          user_agent?: string | null
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
      bias_fairness_audits: {
        Row: {
          ai_system_id: string
          created_at: string
          dataset_description: string | null
          id: string
          metric_type: string
          notes: string | null
          org_id: string
          passed: boolean | null
          score: number | null
          status: string
          threshold: number | null
          updated_at: string | null
        }
        Insert: {
          ai_system_id: string
          created_at?: string
          dataset_description?: string | null
          id?: string
          metric_type?: string
          notes?: string | null
          org_id: string
          passed?: boolean | null
          score?: number | null
          status?: string
          threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_system_id?: string
          created_at?: string
          dataset_description?: string | null
          id?: string
          metric_type?: string
          notes?: string | null
          org_id?: string
          passed?: boolean | null
          score?: number | null
          status?: string
          threshold?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bias_fairness_audits_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bias_fairness_audits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_name: string | null
          content: string
          created_at: string
          excerpt: string
          featured: boolean
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_time: string | null
          slug: string
          source_url: string | null
          status: string
          submitter_email: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          content?: string
          created_at?: string
          excerpt?: string
          featured?: boolean
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          source_url?: string | null
          status?: string
          submitter_email?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string
          excerpt?: string
          featured?: boolean
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          source_url?: string | null
          status?: string
          submitter_email?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      data_lineage_records: {
        Row: {
          ai_system_id: string
          collection_method: string | null
          consent_basis: string | null
          created_at: string
          data_description: string | null
          data_source_name: string
          data_source_type: string
          geographic_origin: string | null
          id: string
          notes: string | null
          org_id: string
          pii_detected: boolean | null
          quality_score: number | null
          retention_period: string | null
          updated_at: string | null
        }
        Insert: {
          ai_system_id: string
          collection_method?: string | null
          consent_basis?: string | null
          created_at?: string
          data_description?: string | null
          data_source_name: string
          data_source_type?: string
          geographic_origin?: string | null
          id?: string
          notes?: string | null
          org_id: string
          pii_detected?: boolean | null
          quality_score?: number | null
          retention_period?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_system_id?: string
          collection_method?: string | null
          consent_basis?: string | null
          created_at?: string
          data_description?: string | null
          data_source_name?: string
          data_source_type?: string
          geographic_origin?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          pii_detected?: boolean | null
          quality_score?: number | null
          retention_period?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_lineage_records_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_lineage_records_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_readiness: {
        Row: {
          ai_system_id: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          data_governance_notes: string | null
          data_governance_reviewed: boolean
          id: string
          operating_model_defined: boolean
          operating_model_notes: string | null
          org_id: string
          oversight_assigned: boolean
          oversight_notes: string | null
          risk_classification_notes: string | null
          risk_classified: boolean
          rule_coverage_notes: string | null
          rule_coverage_verified: boolean
          status: string
          transparency_documented: boolean
          transparency_notes: string | null
          updated_at: string | null
        }
        Insert: {
          ai_system_id: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          data_governance_notes?: string | null
          data_governance_reviewed?: boolean
          id?: string
          operating_model_defined?: boolean
          operating_model_notes?: string | null
          org_id: string
          oversight_assigned?: boolean
          oversight_notes?: string | null
          risk_classification_notes?: string | null
          risk_classified?: boolean
          rule_coverage_notes?: string | null
          rule_coverage_verified?: boolean
          status?: string
          transparency_documented?: boolean
          transparency_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_system_id?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          data_governance_notes?: string | null
          data_governance_reviewed?: boolean
          id?: string
          operating_model_defined?: boolean
          operating_model_notes?: string | null
          org_id?: string
          oversight_assigned?: boolean
          oversight_notes?: string | null
          risk_classification_notes?: string | null
          risk_classified?: boolean
          rule_coverage_notes?: string | null
          rule_coverage_verified?: boolean
          status?: string
          transparency_documented?: boolean
          transparency_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployment_readiness_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: true
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployment_readiness_org_id_fkey"
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
          hash_sequence: number | null
          id: string
          integrity_hash: string | null
          reviewer_id: string | null
          reviewer_name: string | null
          violation_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          decision?: string | null
          hash_sequence?: number | null
          id?: string
          integrity_hash?: string | null
          reviewer_id?: string | null
          reviewer_name?: string | null
          violation_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          decision?: string | null
          hash_sequence?: number | null
          id?: string
          integrity_hash?: string | null
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
      integration_deliveries: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          integration_id: string
          org_id: string
          payload: Json | null
          response_status: number | null
          success: boolean
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          integration_id: string
          org_id: string
          payload?: Json | null
          response_status?: number | null
          success?: boolean
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          integration_id?: string
          org_id?: string
          payload?: Json | null
          response_status?: number | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "integration_deliveries_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_deliveries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          display_name: string
          enabled: boolean
          id: string
          integration_type: string
          last_delivered_at: string | null
          last_error: string | null
          org_id: string
          trigger_events: string[]
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          display_name?: string
          enabled?: boolean
          id?: string
          integration_type: string
          last_delivered_at?: string | null
          last_error?: string | null
          org_id: string
          trigger_events?: string[]
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          display_name?: string
          enabled?: boolean
          id?: string
          integration_type?: string
          last_delivered_at?: string | null
          last_error?: string | null
          org_id?: string
          trigger_events?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          gdpr_consent: boolean
          id: string
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          gdpr_consent?: boolean
          id?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          gdpr_consent?: boolean
          id?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
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
      onboarding_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: string | null
          id: string
          org_id: string
          steps_completed: string[] | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: string | null
          id?: string
          org_id: string
          steps_completed?: string[] | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: string | null
          id?: string
          org_id?: string
          steps_completed?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_org_id_fkey"
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
      reviewer_overrides: {
        Row: {
          created_at: string
          id: string
          org_id: string
          original_decision: string | null
          original_review_id: string
          override_decision: string
          override_reason: string
          override_reviewer_id: string
          violation_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          original_decision?: string | null
          original_review_id: string
          override_decision: string
          override_reason?: string
          override_reviewer_id: string
          violation_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          original_decision?: string | null
          original_review_id?: string
          override_decision?: string
          override_reason?: string
          override_reviewer_id?: string
          violation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviewer_overrides_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviewer_overrides_original_review_id_fkey"
            columns: ["original_review_id"]
            isOneToOne: false
            referencedRelation: "human_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviewer_overrides_violation_id_fkey"
            columns: ["violation_id"]
            isOneToOne: false
            referencedRelation: "violations"
            referencedColumns: ["id"]
          },
        ]
      }
      reviewer_permissions: {
        Row: {
          can_approve_deployments: boolean
          can_manage_rules: boolean
          can_manage_systems: boolean
          can_override_decisions: boolean
          can_review_violations: boolean
          created_at: string
          id: string
          is_backup_reviewer: boolean
          org_id: string
          reviewer_id: string
          reviewer_type: Database["public"]["Enums"]["reviewer_type"]
          updated_at: string | null
        }
        Insert: {
          can_approve_deployments?: boolean
          can_manage_rules?: boolean
          can_manage_systems?: boolean
          can_override_decisions?: boolean
          can_review_violations?: boolean
          created_at?: string
          id?: string
          is_backup_reviewer?: boolean
          org_id: string
          reviewer_id: string
          reviewer_type?: Database["public"]["Enums"]["reviewer_type"]
          updated_at?: string | null
        }
        Update: {
          can_approve_deployments?: boolean
          can_manage_rules?: boolean
          can_manage_systems?: boolean
          can_override_decisions?: boolean
          can_review_violations?: boolean
          created_at?: string
          id?: string
          is_backup_reviewer?: boolean
          org_id?: string
          reviewer_id?: string
          reviewer_type?: Database["public"]["Enums"]["reviewer_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviewer_permissions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          enforcement_mode: string
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
          enforcement_mode?: string
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
          enforcement_mode?: string
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
      scheduled_audits: {
        Row: {
          ai_system_id: string
          assigned_to: string | null
          audit_type: string
          created_at: string
          frequency_days: number
          id: string
          last_completed_at: string | null
          next_due_at: string
          notes: string | null
          org_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          ai_system_id: string
          assigned_to?: string | null
          audit_type?: string
          created_at?: string
          frequency_days?: number
          id?: string
          last_completed_at?: string | null
          next_due_at?: string
          notes?: string | null
          org_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          ai_system_id?: string
          assigned_to?: string | null
          audit_type?: string
          created_at?: string
          frequency_days?: number
          id?: string
          last_completed_at?: string | null
          next_due_at?: string
          notes?: string | null
          org_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_audits_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_audits_org_id_fkey"
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
      vendor_risk_assessments: {
        Row: {
          ai_system_id: string | null
          assessment_date: string | null
          compliance_status: string | null
          contract_terms: string | null
          created_at: string
          data_processing_agreement: boolean | null
          id: string
          notes: string | null
          org_id: string
          risk_score: number | null
          security_review_passed: boolean | null
          status: string
          updated_at: string | null
          vendor_contact: string | null
          vendor_name: string
        }
        Insert: {
          ai_system_id?: string | null
          assessment_date?: string | null
          compliance_status?: string | null
          contract_terms?: string | null
          created_at?: string
          data_processing_agreement?: boolean | null
          id?: string
          notes?: string | null
          org_id: string
          risk_score?: number | null
          security_review_passed?: boolean | null
          status?: string
          updated_at?: string | null
          vendor_contact?: string | null
          vendor_name: string
        }
        Update: {
          ai_system_id?: string | null
          assessment_date?: string | null
          compliance_status?: string | null
          contract_terms?: string | null
          created_at?: string
          data_processing_agreement?: boolean | null
          id?: string
          notes?: string | null
          org_id?: string
          risk_score?: number | null
          security_review_passed?: boolean | null
          status?: string
          updated_at?: string | null
          vendor_contact?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_risk_assessments_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_risk_assessments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      webhook_deliveries: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          org_id: string
          payload: Json | null
          response_status: number | null
          success: boolean | null
          webhook_endpoint_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          org_id: string
          payload?: Json | null
          response_status?: number | null
          success?: boolean | null
          webhook_endpoint_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          org_id?: string
          payload?: Json | null
          response_status?: number | null
          success?: boolean | null
          webhook_endpoint_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_webhook_endpoint_id_fkey"
            columns: ["webhook_endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean | null
          events: string[] | null
          id: string
          org_id: string
          secret: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          events?: string[] | null
          id?: string
          org_id: string
          secret?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          events?: string[] | null
          id?: string
          org_id?: string
          secret?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_blog_posts: {
        Row: {
          author_name: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          id: string | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_time: string | null
          slug: string | null
          source_url: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author_name?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: string | null
          slug?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author_name?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: string | null
          slug?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
      get_analytics_summary: { Args: never; Returns: Json }
      get_org_counts: {
        Args: never
        Returns: {
          org_id: string
          system_count: number
          user_count: number
          violation_count: number
        }[]
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
      reviewer_has_org_access: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "reviewer" | "customer"
      reviewer_type: "company_assigned" | "hfai_appointed"
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
      reviewer_type: ["company_assigned", "hfai_appointed"],
    },
  },
} as const
