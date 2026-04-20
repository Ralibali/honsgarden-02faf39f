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
      achievement_rewards: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_advertisers: {
        Row: {
          adtraction_advertiser_id: string | null
          base_url: string | null
          commission_rate: number | null
          cookie_days: number | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          pin_domain: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          adtraction_advertiser_id?: string | null
          base_url?: string | null
          commission_rate?: number | null
          cookie_days?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          pin_domain?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          adtraction_advertiser_id?: string | null
          base_url?: string | null
          commission_rate?: number | null
          cookie_days?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          pin_domain?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_link_tests: {
        Row: {
          adtraction_registered_at: string | null
          affiliate_url: string
          id: string
          notes: string | null
          product_id: string | null
          registered_correctly: boolean | null
          tested_at: string
          tested_by: string | null
        }
        Insert: {
          adtraction_registered_at?: string | null
          affiliate_url: string
          id?: string
          notes?: string | null
          product_id?: string | null
          registered_correctly?: boolean | null
          tested_at?: string
          tested_by?: string | null
        }
        Update: {
          adtraction_registered_at?: string | null
          affiliate_url?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          registered_correctly?: boolean | null
          tested_at?: string
          tested_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_link_tests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "affiliate_products"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_products: {
        Row: {
          advertiser_id: string | null
          affiliate_url: string | null
          category: string | null
          created_at: string
          currency: string
          description: string | null
          description_md: string | null
          external_id: string | null
          id: string
          image_url: string | null
          image_urls: string[]
          in_stock: boolean | null
          is_active: boolean
          last_scraped_at: string | null
          name: string
          price: string | null
          price_original: number | null
          product_url: string | null
          short_description: string | null
          slug: string | null
          specs: Json
          updated_at: string
        }
        Insert: {
          advertiser_id?: string | null
          affiliate_url?: string | null
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          description_md?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[]
          in_stock?: boolean | null
          is_active?: boolean
          last_scraped_at?: string | null
          name: string
          price?: string | null
          price_original?: number | null
          product_url?: string | null
          short_description?: string | null
          slug?: string | null
          specs?: Json
          updated_at?: string
        }
        Update: {
          advertiser_id?: string | null
          affiliate_url?: string | null
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          description_md?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[]
          in_stock?: boolean | null
          is_active?: boolean
          last_scraped_at?: string | null
          name?: string
          price?: string | null
          price_original?: number | null
          product_url?: string | null
          short_description?: string | null
          slug?: string | null
          specs?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_products_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertiser_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_products_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "affiliate_advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_comments: {
        Row: {
          content: string
          created_at: string
          display_name: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          display_name?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          display_name?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          feature_image_url: string | null
          glossary_ids: string[] | null
          id: string
          is_published: boolean
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number
          word_count: number | null
        }
        Insert: {
          author_id: string
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          feature_image_url?: string | null
          glossary_ids?: string[] | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number
          word_count?: number | null
        }
        Update: {
          author_id?: string
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          feature_image_url?: string | null
          glossary_ids?: string[] | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number
          word_count?: number | null
        }
        Relationships: []
      }
      chore_completions: {
        Row: {
          chore_id: string
          completed_date: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          chore_id: string
          completed_date?: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          chore_id?: string
          completed_date?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chore_completions_chore_id_fkey"
            columns: ["chore_id"]
            isOneToOne: false
            referencedRelation: "daily_chores"
            referencedColumns: ["id"]
          },
        ]
      }
      click_events: {
        Row: {
          created_at: string
          element_id: string | null
          element_text: string | null
          event_name: string
          id: string
          metadata: Json | null
          path: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          element_id?: string | null
          element_text?: string | null
          event_name: string
          id?: string
          metadata?: Json | null
          path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          element_id?: string | null
          element_text?: string | null
          event_name?: string
          id?: string
          metadata?: Json | null
          path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coop_settings: {
        Row: {
          coop_name: string | null
          created_at: string
          hen_count: number | null
          id: string
          location: string | null
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coop_name?: string | null
          created_at?: string
          hen_count?: number | null
          id?: string
          location?: string | null
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coop_name?: string | null
          created_at?: string
          hen_count?: number | null
          id?: string
          location?: string | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_ai_tip: {
        Row: {
          created_at: string
          date: string
          id: string
          season: string
          source: string | null
          tip_text: string
          version: number | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          season: string
          source?: string | null
          tip_text: string
          version?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          season?: string
          source?: string | null
          tip_text?: string
          version?: number | null
        }
        Relationships: []
      }
      daily_chores: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          next_due_at: string | null
          recurrence: string | null
          reminder_enabled: boolean | null
          reminder_hours_before: number | null
          sort_order: number | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          next_due_at?: string | null
          recurrence?: string | null
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          sort_order?: number | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          next_due_at?: string | null
          recurrence?: string | null
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          sort_order?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      egg_goals: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          period: string
          target_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          period?: string
          target_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          period?: string
          target_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      egg_logs: {
        Row: {
          count: number
          created_at: string
          date: string
          flock_id: string | null
          hen_id: string | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          date: string
          flock_id?: string | null
          hen_id?: string | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          flock_id?: string | null
          hen_id?: string | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "egg_logs_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_logs_hen_id_fkey"
            columns: ["hen_id"]
            isOneToOne: false
            referencedRelation: "hens"
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
      farm_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          farm_id: string
          id: string
          invited_by: string
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          farm_id: string
          id?: string
          invited_by: string
          status?: string
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          farm_id?: string
          id?: string
          invited_by?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_invitations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "coop_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_members: {
        Row: {
          farm_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          farm_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          farm_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_members_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "coop_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_records: {
        Row: {
          amount_kg: number | null
          cost: number | null
          created_at: string
          date: string
          feed_type: string | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          amount_kg?: number | null
          cost?: number | null
          created_at?: string
          date: string
          feed_type?: string | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          amount_kg?: number | null
          cost?: number | null
          created_at?: string
          date?: string
          feed_type?: string | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          admin_reply: string | null
          admin_reply_at: string | null
          created_at: string
          id: string
          message: string
          status: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          admin_reply_at?: string | null
          created_at?: string
          id?: string
          message: string
          status?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          admin_reply_at?: string | null
          created_at?: string
          id?: string
          message?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      flocks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hatchings: {
        Row: {
          created_at: string
          egg_count: number
          expected_hatch_date: string | null
          hatched_count: number | null
          id: string
          notes: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          egg_count?: number
          expected_hatch_date?: string | null
          hatched_count?: number | null
          id?: string
          notes?: string | null
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          egg_count?: number
          expected_hatch_date?: string | null
          hatched_count?: number | null
          id?: string
          notes?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_logs: {
        Row: {
          created_at: string
          date: string
          description: string | null
          hen_id: string | null
          id: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          hen_id?: string | null
          id?: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          hen_id?: string | null
          id?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_logs_hen_id_fkey"
            columns: ["hen_id"]
            isOneToOne: false
            referencedRelation: "hens"
            referencedColumns: ["id"]
          },
        ]
      }
      hens: {
        Row: {
          birth_date: string | null
          breed: string | null
          color: string | null
          created_at: string
          flock_id: string | null
          hen_type: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string
          flock_id?: string | null
          hen_type?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string
          flock_id?: string | null
          hen_type?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hens_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
        ]
      }
      link_glossary: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          keyword: string
          rel: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          keyword: string
          rel?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          keyword?: string
          rel?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      notification_reads: {
        Row: {
          id: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          author_id: string
          created_at: string
          id: string
          message: string
          title: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          message: string
          title: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          message?: string
          title?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_lifetime_premium: boolean
          preferences: Json
          premium_expires_at: string | null
          referral_code: string | null
          referred_by: string | null
          subscription_status: string
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_lifetime_premium?: boolean
          preferences?: Json
          premium_expires_at?: string | null
          referral_code?: string | null
          referred_by?: string | null
          subscription_status?: string
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_lifetime_premium?: boolean
          preferences?: Json
          premium_expires_at?: string | null
          referral_code?: string | null
          referred_by?: string | null
          subscription_status?: string
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          function_name: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          function_name: string
          id?: string
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          function_name?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_user_id: string
          referrer_user_id: string
          rewarded: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          referred_user_id: string
          referrer_user_id: string
          rewarded?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          referred_user_id?: string
          referrer_user_id?: string
          rewarded?: boolean
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          created_at: string
          enabled: boolean | null
          evening_reminder: boolean | null
          evening_time: string | null
          id: string
          morning_reminder: boolean | null
          morning_time: string | null
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          evening_reminder?: boolean | null
          evening_time?: string | null
          id?: string
          morning_reminder?: boolean | null
          morning_time?: string | null
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          evening_reminder?: boolean | null
          evening_time?: string | null
          id?: string
          morning_reminder?: boolean | null
          morning_time?: string | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scrape_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          product_id: string | null
          result: Json | null
          source_url: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          product_id?: string | null
          result?: Json | null
          source_url?: string | null
          status: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          product_id?: string | null
          result?: Json | null
          source_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scrape_jobs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "affiliate_products"
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
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type?: string
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      advertiser_config: {
        Row: {
          adtraction_advertiser_id: string | null
          base_tracking_url: string | null
          base_url: string | null
          commission_rate: number | null
          id: string | null
          is_active: boolean | null
          name: string | null
          partner_id: string | null
          pin_domain: string | null
          slug: string | null
        }
        Insert: {
          adtraction_advertiser_id?: string | null
          base_tracking_url?: never
          base_url?: string | null
          commission_rate?: number | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          partner_id?: never
          pin_domain?: string | null
          slug?: string | null
        }
        Update: {
          adtraction_advertiser_id?: string | null
          base_tracking_url?: never
          base_url?: string | null
          commission_rate?: number | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          partner_id?: never
          pin_domain?: string | null
          slug?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      build_affiliate_url: {
        Args: { p_advertiser_id: string; p_product_url: string }
        Returns: string
      }
      check_rate_limit: {
        Args: {
          _function_name: string
          _max_requests: number
          _user_id: string
          _window_minutes?: number
        }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_farm_member_display_names: {
        Args: { _uid: string }
        Returns: {
          display_name: string
          user_id: string
        }[]
      }
      get_farm_user_ids: { Args: { _uid: string }; Returns: string[] }
      get_user_farm_ids: { Args: { _uid: string }; Returns: string[] }
      grant_premium_days: {
        Args: { _days: number; _user_id: string }
        Returns: undefined
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
      process_referral: {
        Args: { _new_user_id: string; _referral_code: string }
        Returns: boolean
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      set_lifetime_premium: {
        Args: { _is_lifetime: boolean; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
