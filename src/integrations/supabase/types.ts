export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      communities: {
        Row: {
          cover_image: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          genesis_nft_collection: string | null
          genesis_nft_contract: string | null
          governance_token_contract: string | null
          id: string
          ipfs_metadata: string | null
          name: string
          token_gate_contract: string | null
          token_gate_threshold: number | null
          updated_at: string | null
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          genesis_nft_collection?: string | null
          genesis_nft_contract?: string | null
          governance_token_contract?: string | null
          id?: string
          ipfs_metadata?: string | null
          name: string
          token_gate_contract?: string | null
          token_gate_threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          genesis_nft_collection?: string | null
          genesis_nft_contract?: string | null
          governance_token_contract?: string | null
          id?: string
          ipfs_metadata?: string | null
          name?: string
          token_gate_contract?: string | null
          token_gate_threshold?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_memberships: {
        Row: {
          community_id: string | null
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["community_role"] | null
          user_id: string | null
          verified_nft_ownership: boolean | null
          wallet_address: string | null
        }
        Insert: {
          community_id?: string | null
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["community_role"] | null
          user_id?: string | null
          verified_nft_ownership?: boolean | null
          wallet_address?: string | null
        }
        Update: {
          community_id?: string | null
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["community_role"] | null
          user_id?: string | null
          verified_nft_ownership?: boolean | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          event_id: string | null
          id: string
          poap_claimed: boolean | null
          rsvp_at: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          poap_claimed?: boolean | null
          rsvp_at?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          poap_claimed?: boolean | null
          rsvp_at?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          community_id: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          event_date: string
          host_id: string | null
          id: string
          ipfs_metadata: string | null
          max_attendees: number | null
          poap_contract: string | null
          status: Database["public"]["Enums"]["event_status"] | null
          title: string
          venue_or_link: string | null
        }
        Insert: {
          community_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          event_date: string
          host_id?: string | null
          id?: string
          ipfs_metadata?: string | null
          max_attendees?: number | null
          poap_contract?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          title: string
          venue_or_link?: string | null
        }
        Update: {
          community_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string
          host_id?: string | null
          id?: string
          ipfs_metadata?: string | null
          max_attendees?: number | null
          poap_contract?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          title?: string
          venue_or_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_sales: {
        Row: {
          buyer_address: string
          id: string
          sale_date: string | null
          sale_price: number
          submission_id: string | null
          transaction_hash: string | null
        }
        Insert: {
          buyer_address: string
          id?: string
          sale_date?: string | null
          sale_price: number
          submission_id?: string | null
          transaction_hash?: string | null
        }
        Update: {
          buyer_address?: string
          id?: string
          sale_date?: string | null
          sale_price?: number
          submission_id?: string | null
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_sales_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "gallery_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_submissions: {
        Row: {
          description: string | null
          gallery_id: string | null
          id: string
          image_url: string
          nft_contract: string | null
          nft_token_id: string | null
          price: number
          sold: boolean | null
          submitted_at: string | null
          submitter_id: string | null
          title: string
        }
        Insert: {
          description?: string | null
          gallery_id?: string | null
          id?: string
          image_url: string
          nft_contract?: string | null
          nft_token_id?: string | null
          price: number
          sold?: boolean | null
          submitted_at?: string | null
          submitter_id?: string | null
          title: string
        }
        Update: {
          description?: string | null
          gallery_id?: string | null
          id?: string
          image_url?: string
          nft_contract?: string | null
          nft_token_id?: string | null
          price?: number
          sold?: boolean | null
          submitted_at?: string | null
          submitter_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_submissions_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "nft_galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_galleries: {
        Row: {
          community_id: string | null
          created_at: string | null
          description: string | null
          id: string
          proposal_id: string | null
          status: string | null
          submission_deadline: string | null
          title: string
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          proposal_id?: string | null
          status?: string | null
          submission_deadline?: string | null
          title: string
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          proposal_id?: string | null
          status?: string | null
          submission_deadline?: string | null
          title?: string
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nft_galleries_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nft_galleries_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          blockchain_hash: string | null
          community_id: string | null
          content: string | null
          created_at: string | null
          id: string
          ipfs_hash: string | null
          media_urls: string[] | null
          post_type: Database["public"]["Enums"]["post_type"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          blockchain_hash?: string | null
          community_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          ipfs_hash?: string | null
          media_urls?: string[] | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          blockchain_hash?: string | null
          community_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          ipfs_hash?: string | null
          media_urls?: string[] | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          ens_name: string | null
          governance_tokens: Json | null
          id: string
          updated_at: string | null
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          ens_name?: string | null
          governance_tokens?: Json | null
          id: string
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          ens_name?: string | null
          governance_tokens?: Json | null
          id?: string
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          community_id: string | null
          created_at: string | null
          creator_id: string | null
          description: string
          id: string
          no_votes: number | null
          proposal_type: string | null
          status: Database["public"]["Enums"]["proposal_status"] | null
          title: string
          total_voting_power: number | null
          voting_end: string | null
          voting_start: string | null
          yes_votes: number | null
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          description: string
          id?: string
          no_votes?: number | null
          proposal_type?: string | null
          status?: Database["public"]["Enums"]["proposal_status"] | null
          title: string
          total_voting_power?: number | null
          voting_end?: string | null
          voting_start?: string | null
          yes_votes?: number | null
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string
          id?: string
          no_votes?: number | null
          proposal_type?: string | null
          status?: Database["public"]["Enums"]["proposal_status"] | null
          title?: string
          total_voting_power?: number | null
          voting_end?: string | null
          voting_start?: string | null
          yes_votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_distributions: {
        Row: {
          amount: number
          distributed_at: string | null
          gallery_id: string | null
          id: string
          member_id: string | null
          transaction_hash: string | null
        }
        Insert: {
          amount: number
          distributed_at?: string | null
          gallery_id?: string | null
          id?: string
          member_id?: string | null
          transaction_hash?: string | null
        }
        Update: {
          amount?: number
          distributed_at?: string | null
          gallery_id?: string | null
          id?: string
          member_id?: string | null
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_distributions_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "nft_galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string | null
          id: string
          proposal_id: string | null
          transaction_hash: string | null
          vote_choice: boolean | null
          voter_id: string | null
          voting_power: number | null
          wallet_signature: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          proposal_id?: string | null
          transaction_hash?: string | null
          vote_choice?: boolean | null
          voter_id?: string | null
          voting_power?: number | null
          wallet_signature?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          proposal_id?: string | null
          transaction_hash?: string | null
          vote_choice?: boolean | null
          voter_id?: string | null
          voting_power?: number | null
          wallet_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      community_role: "admin" | "curator" | "member" | "viewer"
      event_status: "upcoming" | "live" | "completed" | "cancelled"
      post_type: "artwork" | "update" | "announcement"
      proposal_status: "active" | "passed" | "rejected" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      community_role: ["admin", "curator", "member", "viewer"],
      event_status: ["upcoming", "live", "completed", "cancelled"],
      post_type: ["artwork", "update", "announcement"],
      proposal_status: ["active", "passed", "rejected", "expired"],
    },
  },
} as const
