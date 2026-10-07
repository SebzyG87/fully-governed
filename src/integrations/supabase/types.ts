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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          admin_notes: string | null
          amendment_count: number
          beat_needed: boolean | null
          cancelled_at: string | null
          checked_in_at: string | null
          client_notes: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          deposit_amount: number | null
          end_time: string
          excluded_services: Json | null
          extras_purchased: Json | null
          id: string
          included_services: Json | null
          is_private: boolean | null
          no_show_at: string | null
          notes: string | null
          num_guests: number | null
          outstanding_balance: number | null
          overtime_owed: number | null
          overtime_rules: Json | null
          package_purchased: string | null
          payment_provider: string | null
          payment_provider_ref: string | null
          payment_status: string | null
          producer_notes: string | null
          refund_status: string | null
          room_id: string
          security_required: boolean | null
          session_type: string
          start_time: string
          started_at: string | null
          status: string
          total_amount: number | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          admin_notes?: string | null
          amendment_count?: number
          beat_needed?: boolean | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          client_notes?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          deposit_amount?: number | null
          end_time: string
          excluded_services?: Json | null
          extras_purchased?: Json | null
          id?: string
          included_services?: Json | null
          is_private?: boolean | null
          no_show_at?: string | null
          notes?: string | null
          num_guests?: number | null
          outstanding_balance?: number | null
          overtime_owed?: number | null
          overtime_rules?: Json | null
          package_purchased?: string | null
          payment_provider?: string | null
          payment_provider_ref?: string | null
          payment_status?: string | null
          producer_notes?: string | null
          refund_status?: string | null
          room_id: string
          security_required?: boolean | null
          session_type: string
          start_time: string
          started_at?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          admin_notes?: string | null
          amendment_count?: number
          beat_needed?: boolean | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          client_notes?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          deposit_amount?: number | null
          end_time?: string
          excluded_services?: Json | null
          extras_purchased?: Json | null
          id?: string
          included_services?: Json | null
          is_private?: boolean | null
          no_show_at?: string | null
          notes?: string | null
          num_guests?: number | null
          outstanding_balance?: number | null
          overtime_owed?: number | null
          overtime_rules?: Json | null
          package_purchased?: string | null
          payment_provider?: string | null
          payment_provider_ref?: string | null
          payment_status?: string | null
          producer_notes?: string | null
          refund_status?: string | null
          room_id?: string
          security_required?: boolean | null
          session_type?: string
          start_time?: string
          started_at?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      fg_ai_call_logs: {
        Row: {
          ai_provider: string | null
          booking_enquiry_status: string | null
          call_summary: string | null
          call_type: string | null
          caller_number: string | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          follow_up_task_id: string | null
          id: string
          linked_user_id: string | null
          started_at: string | null
          transcript: string | null
        }
        Insert: {
          ai_provider?: string | null
          booking_enquiry_status?: string | null
          call_summary?: string | null
          call_type?: string | null
          caller_number?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          follow_up_task_id?: string | null
          id?: string
          linked_user_id?: string | null
          started_at?: string | null
          transcript?: string | null
        }
        Update: {
          ai_provider?: string | null
          booking_enquiry_status?: string | null
          call_summary?: string | null
          call_type?: string | null
          caller_number?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          follow_up_task_id?: string | null
          id?: string
          linked_user_id?: string | null
          started_at?: string | null
          transcript?: string | null
        }
        Relationships: []
      }
      fg_booking_assignments: {
        Row: {
          assigned_by: string | null
          assignment_role: string
          assignment_status: string
          booking_id: string
          created_at: string
          id: string
          notes: string | null
          staff_user_id: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          assignment_role: string
          assignment_status?: string
          booking_id: string
          created_at?: string
          id?: string
          notes?: string | null
          staff_user_id: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          assignment_role?: string
          assignment_status?: string
          booking_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          staff_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fg_booking_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      fg_booking_lifecycle_events: {
        Row: {
          booking_id: string
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          to_status: string
        }
        Insert: {
          booking_id: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status: string
        }
        Update: {
          booking_id?: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fg_booking_lifecycle_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      fg_cleaning_tasks: {
        Row: {
          assigned_cleaner_id: string | null
          booking_id: string | null
          checklist: Json
          cleaning_window_end: string | null
          cleaning_window_start: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          issue_report: string | null
          notes: string | null
          room_id: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_cleaner_id?: string | null
          booking_id?: string | null
          checklist?: Json
          cleaning_window_end?: string | null
          cleaning_window_start?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          issue_report?: string | null
          notes?: string | null
          room_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_cleaner_id?: string | null
          booking_id?: string | null
          checklist?: Json
          cleaning_window_end?: string | null
          cleaning_window_start?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          issue_report?: string | null
          notes?: string | null
          room_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fg_cleaning_tasks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      fg_client_verifications: {
        Row: {
          admin_status: string | null
          booking_id: string | null
          created_at: string
          guest_name: string | null
          id: string
          id_document_url: string | null
          is_guest: boolean
          rejected_reason: string | null
          selfie_url: string | null
          status: string
          updated_at: string
          user_id: string
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
          waiver_signed_at: string | null
        }
        Insert: {
          admin_status?: string | null
          booking_id?: string | null
          created_at?: string
          guest_name?: string | null
          id?: string
          id_document_url?: string | null
          is_guest?: boolean
          rejected_reason?: string | null
          selfie_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          waiver_signed_at?: string | null
        }
        Update: {
          admin_status?: string | null
          booking_id?: string | null
          created_at?: string
          guest_name?: string | null
          id?: string
          id_document_url?: string | null
          is_guest?: boolean
          rejected_reason?: string | null
          selfie_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          waiver_signed_at?: string | null
        }
        Relationships: []
      }
      fg_email_queue: {
        Row: {
          attempts: number
          booking_id: string | null
          created_at: string
          error_message: string | null
          id: string
          payload: Json
          provider_message_id: string | null
          recipient_email: string
          recipient_user_id: string | null
          send_after: string
          sent_at: string | null
          status: string
          template_key: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          booking_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json
          provider_message_id?: string | null
          recipient_email: string
          recipient_user_id?: string | null
          send_after?: string
          sent_at?: string | null
          status?: string
          template_key: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          booking_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json
          provider_message_id?: string | null
          recipient_email?: string
          recipient_user_id?: string | null
          send_after?: string
          sent_at?: string | null
          status?: string
          template_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      fg_incidents: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          incident_type: string
          notes: string | null
          reported_by: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          room_id: string | null
          severity: string
          updated_at: string
          visible_to_client: boolean
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          incident_type: string
          notes?: string | null
          reported_by?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          room_id?: string | null
          severity?: string
          updated_at?: string
          visible_to_client?: boolean
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          incident_type?: string
          notes?: string | null
          reported_by?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          room_id?: string | null
          severity?: string
          updated_at?: string
          visible_to_client?: boolean
        }
        Relationships: []
      }
      fg_room_buffers: {
        Row: {
          buffer_minutes: number
          cleaning_required: boolean
          created_at: string
          id: string
          room_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          buffer_minutes?: number
          cleaning_required?: boolean
          created_at?: string
          id?: string
          room_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          buffer_minutes?: number
          cleaning_required?: boolean
          created_at?: string
          id?: string
          room_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fg_room_buffers_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      fg_session_notes: {
        Row: {
          author_id: string
          booking_id: string
          content: string
          created_at: string
          id: string
          note_type: string
          updated_at: string
        }
        Insert: {
          author_id: string
          booking_id: string
          content: string
          created_at?: string
          id?: string
          note_type?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          booking_id?: string
          content?: string
          created_at?: string
          id?: string
          note_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fg_session_notes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      fg_studio_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      clothing_orders: {
        Row: {
          artist_id: string
          buyer_first_name: string | null
          buyer_id: string
          colour: string | null
          created_at: string
          fulfillment_status: string | null
          id: string
          product_id: string | null
          quantity: number
          seller_id: string | null
          shipping_address: string | null
          size: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          artist_id: string
          buyer_first_name?: string | null
          buyer_id: string
          colour?: string | null
          created_at?: string
          fulfillment_status?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          seller_id?: string | null
          shipping_address?: string | null
          size?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          artist_id?: string
          buyer_first_name?: string | null
          buyer_id?: string
          colour?: string | null
          created_at?: string
          fulfillment_status?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          seller_id?: string | null
          shipping_address?: string | null
          size?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clothing_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "clothing_products"
            referencedColumns: ["id"]
          }
        ]
      }
      clothing_products: {
        Row: {
          artwork_url: string | null
          base_colour: string
          base_price: number
          created_at: string
          description: string | null
          design_data: Json | null
          id: string
          image_url: string | null
          name: string
          placement: string | null
          product_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_url?: string | null
          base_colour?: string
          base_price?: number
          created_at?: string
          description?: string | null
          design_data?: Json | null
          id?: string
          image_url?: string | null
          name: string
          placement?: string | null
          product_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_url?: string | null
          base_colour?: string
          base_price?: number
          created_at?: string
          description?: string | null
          design_data?: Json | null
          id?: string
          image_url?: string | null
          name?: string
          placement?: string | null
          product_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      collabo_posts: {
        Row: {
          created_at: string
          description: string | null
          genre: string | null
          id: string
          post_type: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          post_type?: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          post_type?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          read: boolean | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          read?: boolean | null
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean | null
          subject?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      engineers: {
        Row: {
          availability: string | null
          created_at: string
          id: string
          name: string
          speciality: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string
          id?: string
          name: string
          speciality?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string
          id?: string
          name?: string
          speciality?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      help_articles: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      music_tracks: {
        Row: {
          cover_url: string | null
          created_at: string
          file_url: string | null
          genre: string | null
          id: string
          is_nft: boolean
          nft_copy_limit: number | null
          price: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          file_url?: string | null
          genre?: string | null
          id?: string
          is_nft?: boolean
          nft_copy_limit?: number | null
          price?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          file_url?: string | null
          genre?: string | null
          id?: string
          is_nft?: boolean
          nft_copy_limit?: number | null
          price?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          artist_role: string | null
          avatar_3d_url: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          credits_balance: number
          display_name: string | null
          full_name: string
          genre: string | null
          id: string
          in_building: boolean | null
          instagram: string | null
          loyalty_points: number
          membership_tier: string | null
          onboarding_complete: boolean
          phone: string | null
          pin: string | null
          soundcloud: string | null
          spotify: string | null
          studio_role: string | null
          tiktok: string | null
          twitter: string | null
          updated_at: string
          user_id: string
          youtube: string | null
        }
        Insert: {
          artist_role?: string | null
          avatar_3d_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits_balance?: number
          display_name?: string | null
          full_name: string
          genre?: string | null
          id?: string
          in_building?: boolean | null
          instagram?: string | null
          loyalty_points?: number
          membership_tier?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          pin?: string | null
          soundcloud?: string | null
          spotify?: string | null
          studio_role?: string | null
          tiktok?: string | null
          twitter?: string | null
          updated_at?: string
          user_id: string
          youtube?: string | null
        }
        Update: {
          artist_role?: string | null
          avatar_3d_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits_balance?: number
          display_name?: string | null
          full_name?: string
          genre?: string | null
          id?: string
          in_building?: boolean | null
          instagram?: string | null
          loyalty_points?: number
          membership_tier?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          pin?: string | null
          soundcloud?: string | null
          spotify?: string | null
          studio_role?: string | null
          tiktok?: string | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
          youtube?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string
          id: string
          item_id: string
          item_type: string
          status: string | null
          stripe_payment_id: string | null
        }
        Insert: {
          amount?: number
          buyer_id: string
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          status?: string | null
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          status?: string | null
          stripe_payment_id?: string | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          budget: string | null
          created_at: string
          description: string | null
          email: string
          id: string
          name: string
          phone: string | null
          referral_source: string | null
          service: string
          status: string
          timeline: string | null
          updated_at: string
        }
        Insert: {
          budget?: string | null
          created_at?: string
          description?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          referral_source?: string | null
          service: string
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          budget?: string | null
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          referral_source?: string | null
          service?: string
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      redemption_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          redeemed_at: string | null
          redeemed_by: string | null
          track_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          track_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemption_codes_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          }
        ]
      }
      rooms: {
        Row: {
          amenities: Json | null
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          pricing: Json | null
          session_types: string[] | null
          slug: string
        }
        Insert: {
          amenities?: Json | null
          color: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          pricing?: Json | null
          session_types?: string[] | null
          slug: string
        }
        Update: {
          amenities?: Json | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          pricing?: Json | null
          session_types?: string[] | null
          slug?: string
        }
        Relationships: []
      }
      session_ratings: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      shop_items: {
        Row: {
          artist_name: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          stock_count: number
          updated_at: string
        }
        Insert: {
          artist_name?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price?: number
          stock_count?: number
          updated_at?: string
        }
        Update: {
          artist_name?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          stock_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      street_team_applications: {
        Row: {
          admin_notes: string | null
          availability: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          instagram: string | null
          location: string | null
          phone: string | null
          reason: string | null
          skills: string[] | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          availability?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          instagram?: string | null
          location?: string | null
          phone?: string | null
          reason?: string | null
          skills?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          availability?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          instagram?: string | null
          location?: string | null
          phone?: string | null
          reason?: string | null
          skills?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      street_team_members: {
        Row: {
          id: string
          joined_at: string
          points: number
          tier: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          points?: number
          tier?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          points?: number
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      street_team_rewards: {
        Row: {
          available: boolean | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          points_cost: number
          stock: number
          title: string
        }
        Insert: {
          available?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          points_cost?: number
          stock?: number
          title: string
        }
        Update: {
          available?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          points_cost?: number
          stock?: number
          title?: string
        }
        Relationships: []
      }
      street_team_task_completions: {
        Row: {
          created_at: string
          id: string
          proof_url: string | null
          status: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          proof_url?: string | null
          status?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          proof_url?: string | null
          status?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "street_team_task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "street_team_tasks"
            referencedColumns: ["id"]
          }
        ]
      }
      street_team_tasks: {
        Row: {
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          location: string | null
          points_reward: number
          status: string
          task_type: string
          title: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          points_reward?: number
          status?: string
          task_type?: string
          title: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          points_reward?: number
          status?: string
          task_type?: string
          title?: string
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
      vehicle_registrations: {
        Row: {
          created_at: string
          id: string
          registration_number: string
          visit_date: string
          visitor_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          registration_number: string
          visit_date?: string
          visitor_name: string
        }
        Update: {
          created_at?: string
          id?: string
          registration_number?: string
          visit_date?: string
          visitor_name?: string
        }
        Relationships: []
      }
      wallet_ledger: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      fg_ban_registry: {
        Row: {
          audit_trail: Json
          ban_status: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          linked_incident_id: string | null
          linked_user_id: string | null
          person_name: string
          person_type: string
          reason: string
          required_action: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          review_status: string
          risk_status: string
          updated_at: string
        }
        Insert: {
          audit_trail?: Json
          ban_status?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          linked_incident_id?: string | null
          linked_user_id?: string | null
          person_name: string
          person_type?: string
          reason: string
          required_action?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          review_status?: string
          risk_status?: string
          updated_at?: string
        }
        Update: {
          audit_trail?: Json
          ban_status?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          linked_incident_id?: string | null
          linked_user_id?: string | null
          person_name?: string
          person_type?: string
          reason?: string
          required_action?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          review_status?: string
          risk_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      fg_loyalty_points: {
        Row: {
          created_at: string | null
          id: string
          points: number
          reason: string
          reference_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points: number
          reason: string
          reference_id?: string | null
          source: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points?: number
          reason?: string
          reference_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fg_get_room_buffer: {
        Args: { _room_id: string }
        Returns: number
      }
      fg_check_room_availability: {
        Args: {
          _room_id: string
          _start_time: string
          _end_time: string
          _exclude_booking_id?: string
        }
        Returns: boolean
      }
      fg_get_studio_role: {
        Args: { _user_id: string }
        Returns: string
      }
      fg_is_assigned_to_booking: {
        Args: { _booking_id: string }
        Returns: boolean
      }
      fg_is_cleaner: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      fg_is_manager_or_above: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      fg_is_producer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      fg_is_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      fg_is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      fg_todays_room_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          room_id: string
          room_name: string
          room_slug: string
          room_color: string
          current_booking_id: string | null
          current_booking_status: string | null
          current_client_user_id: string | null
          current_session_type: string | null
          current_start_time: string | null
          current_end_time: string | null
          next_booking_id: string | null
          next_start_time: string | null
          assigned_producer_id: string | null
          cleaning_task_id: string | null
          cleaning_task_status: string | null
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "family"
        | "customer"
        | "creator_admin"
        | "super_admin"
        | "studio_manager"
        | "session_producer"
        | "cleaner"
        | "client_artist"
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
      app_role: [
        "family",
        "customer",
        "creator_admin",
        "super_admin",
        "studio_manager",
        "session_producer",
        "cleaner",
        "client_artist",
      ],
    },
  },
} as const

// Convenience studio-role types derived from the generated schema
export type StudioRoleValue =
  | "super_admin"
  | "studio_manager"
  | "session_producer"
  | "cleaner"
  | "client_artist"

export type BookingRow = import("./types").Tables<"bookings">
export type BookingInsert = import("./types").TablesInsert<"bookings">
export type CleaningTaskRow = import("./types").Tables<"fg_cleaning_tasks">
export type IncidentRow = import("./types").Tables<"fg_incidents">
export type AssignmentRow = import("./types").Tables<"fg_booking_assignments">
export type LifecycleEventRow = import("./types").Tables<"fg_booking_lifecycle_events">
export type VerificationRow = import("./types").Tables<"fg_client_verifications">
export type EmailQueueRow = import("./types").Tables<"fg_email_queue">
export type SessionNoteRow = import("./types").Tables<"fg_session_notes">
export type StudioSettingRow = import("./types").Tables<"fg_studio_settings">
export type RoomBufferRow = import("./types").Tables<"fg_room_buffers">
