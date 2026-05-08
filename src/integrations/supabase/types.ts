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
          amendment_count: number
          beat_needed: boolean | null
          created_at: string
          end_time: string
          id: string
          is_private: boolean | null
          notes: string | null
          num_guests: number | null
          room_id: string
          security_required: boolean | null
          session_type: string
          start_time: string
          status: string
          user_id: string
        }
        Insert: {
          amendment_count?: number
          beat_needed?: boolean | null
          created_at?: string
          end_time: string
          id?: string
          is_private?: boolean | null
          notes?: string | null
          num_guests?: number | null
          room_id: string
          security_required?: boolean | null
          session_type: string
          start_time: string
          status?: string
          user_id: string
        }
        Update: {
          amendment_count?: number
          beat_needed?: boolean | null
          created_at?: string
          end_time?: string
          id?: string
          is_private?: boolean | null
          notes?: string | null
          num_guests?: number | null
          room_id?: string
          security_required?: boolean | null
          session_type?: string
          start_time?: string
          status?: string
          user_id?: string
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
      app_role: "family" | "customer" | "creator_admin"
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
      app_role: ["family", "customer", "creator_admin"],
    },
  },
} as const
