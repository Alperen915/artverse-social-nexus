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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      artverse_transfers: {
        Row: {
          artverse_dao_id: string | null
          bros_chain_tx_hash: string | null
          community_id: string | null
          completion_date: string | null
          id: string
          initiated_by: string | null
          metadata: Json | null
          transfer_date: string | null
          transfer_status: string | null
        }
        Insert: {
          artverse_dao_id?: string | null
          bros_chain_tx_hash?: string | null
          community_id?: string | null
          completion_date?: string | null
          id?: string
          initiated_by?: string | null
          metadata?: Json | null
          transfer_date?: string | null
          transfer_status?: string | null
        }
        Update: {
          artverse_dao_id?: string | null
          bros_chain_tx_hash?: string | null
          community_id?: string | null
          completion_date?: string | null
          id?: string
          initiated_by?: string | null
          metadata?: Json | null
          transfer_date?: string | null
          transfer_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artverse_transfers_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artverse_transfers_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_bids: {
        Row: {
          auction_id: string | null
          bid_amount: number
          bidder_address: string
          created_at: string | null
          id: string
          transaction_hash: string | null
        }
        Insert: {
          auction_id?: string | null
          bid_amount: number
          bidder_address: string
          created_at?: string | null
          id?: string
          transaction_hash?: string | null
        }
        Update: {
          auction_id?: string | null
          bid_amount?: number
          bidder_address?: string
          created_at?: string | null
          id?: string
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "nft_auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      blockchain_transactions: {
        Row: {
          block_number: number | null
          created_at: string | null
          from_address: string
          gas_price: number | null
          gas_used: number | null
          id: string
          metadata: Json | null
          status: string | null
          to_address: string | null
          transaction_type: string
          tx_hash: string
          value: number | null
        }
        Insert: {
          block_number?: number | null
          created_at?: string | null
          from_address: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          metadata?: Json | null
          status?: string | null
          to_address?: string | null
          transaction_type: string
          tx_hash: string
          value?: number | null
        }
        Update: {
          block_number?: number | null
          created_at?: string | null
          from_address?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          metadata?: Json | null
          status?: string | null
          to_address?: string | null
          transaction_type?: string
          tx_hash?: string
          value?: number | null
        }
        Relationships: []
      }
      bundle_items: {
        Row: {
          bundle_id: string | null
          created_at: string | null
          id: string
          nft_contract: string
          token_id: string
        }
        Insert: {
          bundle_id?: string | null
          created_at?: string | null
          id?: string
          nft_contract: string
          token_id: string
        }
        Update: {
          bundle_id?: string | null
          created_at?: string | null
          id?: string
          nft_contract?: string
          token_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "nft_bundles"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborative_nfts: {
        Row: {
          community_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          mint_transaction_hash: string | null
          nft_contract: string | null
          status: string
          title: string
          token_id: string | null
          total_shares: number
          updated_at: string | null
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          mint_transaction_hash?: string | null
          nft_contract?: string | null
          status?: string
          title: string
          token_id?: string | null
          total_shares?: number
          updated_at?: string | null
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          mint_transaction_hash?: string | null
          nft_contract?: string | null
          status?: string
          title?: string
          token_id?: string | null
          total_shares?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborative_nfts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          artverse_status: string | null
          artverse_transfer_date: string | null
          bros_chain_address: string | null
          bros_chain_network: string | null
          cover_image: string | null
          created_at: string | null
          creator_id: string | null
          dao_treasury_balance: number | null
          description: string | null
          genesis_nft_collection: string | null
          genesis_nft_contract: string | null
          governance_token_contract: string | null
          id: string
          ipfs_metadata: string | null
          is_dao: boolean | null
          membership_is_free: boolean | null
          membership_token_requirement: number | null
          name: string
          token_gate_contract: string | null
          token_gate_threshold: number | null
          updated_at: string | null
        }
        Insert: {
          artverse_status?: string | null
          artverse_transfer_date?: string | null
          bros_chain_address?: string | null
          bros_chain_network?: string | null
          cover_image?: string | null
          created_at?: string | null
          creator_id?: string | null
          dao_treasury_balance?: number | null
          description?: string | null
          genesis_nft_collection?: string | null
          genesis_nft_contract?: string | null
          governance_token_contract?: string | null
          id?: string
          ipfs_metadata?: string | null
          is_dao?: boolean | null
          membership_is_free?: boolean | null
          membership_token_requirement?: number | null
          name: string
          token_gate_contract?: string | null
          token_gate_threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          artverse_status?: string | null
          artverse_transfer_date?: string | null
          bros_chain_address?: string | null
          bros_chain_network?: string | null
          cover_image?: string | null
          created_at?: string | null
          creator_id?: string | null
          dao_treasury_balance?: number | null
          description?: string | null
          genesis_nft_collection?: string | null
          genesis_nft_contract?: string | null
          governance_token_contract?: string | null
          id?: string
          ipfs_metadata?: string | null
          is_dao?: boolean | null
          membership_is_free?: boolean | null
          membership_token_requirement?: number | null
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
      community_projects: {
        Row: {
          community_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          project_type: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          project_type?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          project_type?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_projects_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      dao_multisig_wallets: {
        Row: {
          community_id: string
          created_at: string
          id: string
          required_signatures: number
          signers: string[]
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          required_signatures?: number
          signers?: string[]
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          required_signatures?: number
          signers?: string[]
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dao_multisig_wallets_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      dao_tokens: {
        Row: {
          community_id: string
          created_at: string
          creator_id: string
          deployment_tx_hash: string
          description: string | null
          id: string
          network: string
          status: string
          token_address: string
          token_name: string
          token_symbol: string
          total_supply: number
          updated_at: string
        }
        Insert: {
          community_id: string
          created_at?: string
          creator_id: string
          deployment_tx_hash: string
          description?: string | null
          id?: string
          network?: string
          status?: string
          token_address: string
          token_name: string
          token_symbol: string
          total_supply: number
          updated_at?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          creator_id?: string
          deployment_tx_hash?: string
          description?: string | null
          id?: string
          network?: string
          status?: string
          token_address?: string
          token_name?: string
          token_symbol?: string
          total_supply?: number
          updated_at?: string
        }
        Relationships: []
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
      faucet_claims: {
        Row: {
          amount: string
          chain_id: string
          claimed_at: string | null
          id: string
          tx_hash: string | null
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          amount: string
          chain_id: string
          claimed_at?: string | null
          id?: string
          tx_hash?: string | null
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          amount?: string
          chain_id?: string
          claimed_at?: string | null
          id?: string
          tx_hash?: string | null
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
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
      gallery_submission_requirements: {
        Row: {
          created_at: string | null
          current_submissions: number | null
          gallery_id: string | null
          id: string
          is_compliant: boolean | null
          required_submissions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_submissions?: number | null
          gallery_id?: string | null
          id?: string
          is_compliant?: boolean | null
          required_submissions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_submissions?: number | null
          gallery_id?: string | null
          id?: string
          is_compliant?: boolean | null
          required_submissions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_submission_requirements_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "nft_galleries"
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
      nft_auctions: {
        Row: {
          created_at: string | null
          current_bid: number | null
          end_time: string
          highest_bidder: string | null
          id: string
          nft_contract: string
          reserve_price: number | null
          seller_address: string
          start_time: string
          starting_price: number
          status: string
          token_id: string
        }
        Insert: {
          created_at?: string | null
          current_bid?: number | null
          end_time: string
          highest_bidder?: string | null
          id?: string
          nft_contract: string
          reserve_price?: number | null
          seller_address: string
          start_time?: string
          starting_price: number
          status?: string
          token_id: string
        }
        Update: {
          created_at?: string | null
          current_bid?: number | null
          end_time?: string
          highest_bidder?: string | null
          id?: string
          nft_contract?: string
          reserve_price?: number | null
          seller_address?: string
          start_time?: string
          starting_price?: number
          status?: string
          token_id?: string
        }
        Relationships: []
      }
      nft_bundles: {
        Row: {
          buyer_address: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          sold_at: string | null
          status: string
          title: string
          total_price: number
        }
        Insert: {
          buyer_address?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          sold_at?: string | null
          status?: string
          title: string
          total_price: number
        }
        Update: {
          buyer_address?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          sold_at?: string | null
          status?: string
          title?: string
          total_price?: number
        }
        Relationships: []
      }
      nft_collaborators: {
        Row: {
          approved: boolean | null
          collaborative_nft_id: string | null
          contribution_description: string | null
          id: string
          joined_at: string | null
          role: string
          share_percentage: number
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          approved?: boolean | null
          collaborative_nft_id?: string | null
          contribution_description?: string | null
          id?: string
          joined_at?: string | null
          role: string
          share_percentage: number
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          approved?: boolean | null
          collaborative_nft_id?: string | null
          contribution_description?: string | null
          id?: string
          joined_at?: string | null
          role?: string
          share_percentage?: number
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nft_collaborators_collaborative_nft_id_fkey"
            columns: ["collaborative_nft_id"]
            isOneToOne: false
            referencedRelation: "collaborative_nfts"
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
          mandatory_submission: boolean | null
          min_submissions_per_member: number | null
          nft_price: number | null
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
          mandatory_submission?: boolean | null
          min_submissions_per_member?: number | null
          nft_price?: number | null
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
          mandatory_submission?: boolean | null
          min_submissions_per_member?: number | null
          nft_price?: number | null
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
      nft_listings: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          listing_hash: string | null
          marketplace: string
          mint_id: string | null
          price: number
          seller_address: string
          status: string | null
          transaction_hash: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          listing_hash?: string | null
          marketplace: string
          mint_id?: string | null
          price: number
          seller_address: string
          status?: string | null
          transaction_hash?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          listing_hash?: string | null
          marketplace?: string
          mint_id?: string | null
          price?: number
          seller_address?: string
          status?: string | null
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nft_listings_mint_id_fkey"
            columns: ["mint_id"]
            isOneToOne: false
            referencedRelation: "nft_mints"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_mints: {
        Row: {
          contract_address: string
          gas_price: number | null
          gas_used: number | null
          id: string
          metadata_uri: string | null
          mint_date: string | null
          minter_address: string
          status: string | null
          submission_id: string | null
          token_id: string
          transaction_hash: string
        }
        Insert: {
          contract_address: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          metadata_uri?: string | null
          mint_date?: string | null
          minter_address: string
          status?: string | null
          submission_id?: string | null
          token_id: string
          transaction_hash: string
        }
        Update: {
          contract_address?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          metadata_uri?: string | null
          mint_date?: string | null
          minter_address?: string
          status?: string | null
          submission_id?: string | null
          token_id?: string
          transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_mints_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "gallery_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_price_history: {
        Row: {
          buyer_address: string
          id: string
          marketplace: string
          nft_contract: string
          price: number
          sale_date: string | null
          sale_type: string
          seller_address: string
          token_id: string
          transaction_hash: string
        }
        Insert: {
          buyer_address: string
          id?: string
          marketplace: string
          nft_contract: string
          price: number
          sale_date?: string | null
          sale_type: string
          seller_address: string
          token_id: string
          transaction_hash: string
        }
        Update: {
          buyer_address?: string
          id?: string
          marketplace?: string
          nft_contract?: string
          price?: number
          sale_date?: string | null
          sale_type?: string
          seller_address?: string
          token_id?: string
          transaction_hash?: string
        }
        Relationships: []
      }
      nft_rentals: {
        Row: {
          collateral_amount: number
          created_at: string | null
          daily_rate: number
          end_date: string | null
          id: string
          lender_address: string
          nft_contract: string
          renter_address: string | null
          start_date: string | null
          status: string
          token_id: string
          transaction_hash: string | null
        }
        Insert: {
          collateral_amount: number
          created_at?: string | null
          daily_rate: number
          end_date?: string | null
          id?: string
          lender_address: string
          nft_contract: string
          renter_address?: string | null
          start_date?: string | null
          status?: string
          token_id: string
          transaction_hash?: string | null
        }
        Update: {
          collateral_amount?: number
          created_at?: string | null
          daily_rate?: number
          end_date?: string | null
          id?: string
          lender_address?: string
          nft_contract?: string
          renter_address?: string | null
          start_date?: string | null
          status?: string
          token_id?: string
          transaction_hash?: string | null
        }
        Relationships: []
      }
      nft_royalties: {
        Row: {
          created_at: string | null
          creator_address: string
          id: string
          nft_contract: string
          royalty_percentage: number
          token_id: string
        }
        Insert: {
          created_at?: string | null
          creator_address: string
          id?: string
          nft_contract: string
          royalty_percentage: number
          token_id: string
        }
        Update: {
          created_at?: string | null
          creator_address?: string
          id?: string
          nft_contract?: string
          royalty_percentage?: number
          token_id?: string
        }
        Relationships: []
      }
      pending_multisig_transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          description: string | null
          executed_at: string | null
          id: string
          signatures: string[]
          status: string
          to_address: string
          transaction_hash: string | null
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          description?: string | null
          executed_at?: string | null
          id?: string
          signatures?: string[]
          status?: string
          to_address: string
          transaction_hash?: string | null
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          description?: string | null
          executed_at?: string | null
          id?: string
          signatures?: string[]
          status?: string
          to_address?: string
          transaction_hash?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_multisig_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "dao_multisig_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
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
      project_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          position: number
          priority: string | null
          project_id: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string | null
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string | null
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "community_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_actions: {
        Row: {
          action_params: Json
          action_type: string
          created_at: string
          executed: boolean
          executed_at: string | null
          execution_result: Json | null
          id: string
          proposal_id: string
        }
        Insert: {
          action_params?: Json
          action_type: string
          created_at?: string
          executed?: boolean
          executed_at?: string | null
          execution_result?: Json | null
          id?: string
          proposal_id: string
        }
        Update: {
          action_params?: Json
          action_type?: string
          created_at?: string
          executed?: boolean
          executed_at?: string | null
          execution_result?: Json | null
          id?: string
          proposal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_actions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          created_at: string
          created_by: string | null
          default_fields: Json
          description: string | null
          id: string
          is_system: boolean
          template_name: string
          template_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          default_fields?: Json
          description?: string | null
          id?: string
          is_system?: boolean
          template_name: string
          template_type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          default_fields?: Json
          description?: string | null
          id?: string
          is_system?: boolean
          template_name?: string
          template_type?: string
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
          template_id: string | null
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
          template_id?: string | null
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
          template_id?: string | null
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
          {
            foreignKeyName: "proposals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "proposal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      public_event_rsvps: {
        Row: {
          email: string | null
          event_id: string | null
          id: string
          name: string | null
          rsvp_at: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          email?: string | null
          event_id?: string | null
          id?: string
          name?: string | null
          rsvp_at?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          email?: string | null
          event_id?: string | null
          id?: string
          name?: string | null
          rsvp_at?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      public_events: {
        Row: {
          cover_image: string | null
          created_at: string | null
          description: string | null
          event_date: string
          host_id: string | null
          id: string
          is_paid: boolean | null
          max_attendees: number | null
          status: string | null
          ticket_price: number | null
          title: string
          venue_or_link: string | null
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          event_date: string
          host_id?: string | null
          id?: string
          is_paid?: boolean | null
          max_attendees?: number | null
          status?: string | null
          ticket_price?: number | null
          title: string
          venue_or_link?: string | null
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string
          host_id?: string | null
          id?: string
          is_paid?: boolean | null
          max_attendees?: number | null
          status?: string | null
          ticket_price?: number | null
          title?: string
          venue_or_link?: string | null
        }
        Relationships: []
      }
      public_nft_marketplace: {
        Row: {
          buyer_address: string | null
          created_at: string | null
          id: string
          mint_id: string | null
          price: number
          seller_address: string
          sold_at: string | null
          status: string | null
          submission_id: string | null
          transaction_hash: string | null
        }
        Insert: {
          buyer_address?: string | null
          created_at?: string | null
          id?: string
          mint_id?: string | null
          price: number
          seller_address: string
          sold_at?: string | null
          status?: string | null
          submission_id?: string | null
          transaction_hash?: string | null
        }
        Update: {
          buyer_address?: string | null
          created_at?: string | null
          id?: string
          mint_id?: string | null
          price?: number
          seller_address?: string
          sold_at?: string | null
          status?: string | null
          submission_id?: string | null
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_nft_marketplace_mint_id_fkey"
            columns: ["mint_id"]
            isOneToOne: false
            referencedRelation: "nft_mints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_nft_marketplace_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "gallery_submissions"
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
      revenue_payouts: {
        Row: {
          amount: number
          created_at: string | null
          gallery_id: string | null
          id: string
          paid_at: string | null
          payout_address: string
          status: string | null
          transaction_hash: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          gallery_id?: string | null
          id?: string
          paid_at?: string | null
          payout_address: string
          status?: string | null
          transaction_hash?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          gallery_id?: string | null
          id?: string
          paid_at?: string | null
          payout_address?: string
          status?: string | null
          transaction_hash?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_payouts_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "nft_galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_distributions: {
        Row: {
          amount: number
          distributed_at: string | null
          id: string
          nft_contract: string
          recipient_address: string
          sale_transaction_hash: string
          token_id: string
        }
        Insert: {
          amount: number
          distributed_at?: string | null
          id?: string
          nft_contract: string
          recipient_address: string
          sale_transaction_hash: string
          token_id: string
        }
        Update: {
          amount?: number
          distributed_at?: string | null
          id?: string
          nft_contract?: string
          recipient_address?: string
          sale_transaction_hash?: string
          token_id?: string
        }
        Relationships: []
      }
      shared_resources: {
        Row: {
          category: string | null
          community_id: string | null
          description: string | null
          download_count: number | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_public: boolean | null
          title: string
          uploaded_at: string | null
          uploader_id: string | null
        }
        Insert: {
          category?: string | null
          community_id?: string | null
          description?: string | null
          download_count?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          uploaded_at?: string | null
          uploader_id?: string | null
        }
        Update: {
          category?: string | null
          community_id?: string | null
          description?: string | null
          download_count?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          uploaded_at?: string | null
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_resources_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      token_marketplace_listings: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          price_per_token: number
          seller: string
          status: string
          token_address: string
          total_price: number
          transaction_hash: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          id?: string
          price_per_token: number
          seller: string
          status?: string
          token_address: string
          total_price: number
          transaction_hash?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          price_per_token?: number
          seller?: string
          status?: string
          token_address?: string
          total_price?: number
          transaction_hash?: string | null
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          amount: number
          block_number: number | null
          created_at: string
          from_address: string
          id: string
          price_per_token: number
          to_address: string
          token_address: string
          total_price: number
          transaction_hash: string
          transaction_type: string
        }
        Insert: {
          amount: number
          block_number?: number | null
          created_at?: string
          from_address: string
          id?: string
          price_per_token: number
          to_address: string
          token_address: string
          total_price: number
          transaction_hash: string
          transaction_type: string
        }
        Update: {
          amount?: number
          block_number?: number | null
          created_at?: string
          from_address?: string
          id?: string
          price_per_token?: number
          to_address?: string
          token_address?: string
          total_price?: number
          transaction_hash?: string
          transaction_type?: string
        }
        Relationships: []
      }
      treasury_transactions: {
        Row: {
          amount: number
          community_id: string
          created_at: string
          created_by: string | null
          description: string | null
          from_address: string | null
          id: string
          to_address: string | null
          transaction_hash: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          community_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          from_address?: string | null
          id?: string
          to_address?: string | null
          transaction_hash?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          community_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          from_address?: string | null
          id?: string
          to_address?: string | null
          transaction_hash?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "treasury_transactions_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_token_balances: {
        Row: {
          balance: number
          chain_id: string | null
          chain_name: string
          created_at: string | null
          id: string
          last_synced: string | null
          token_symbol: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number
          chain_id?: string | null
          chain_name?: string
          created_at?: string | null
          id?: string
          last_synced?: string | null
          token_symbol?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number
          chain_id?: string | null
          chain_name?: string
          created_at?: string | null
          id?: string
          last_synced?: string | null
          token_symbol?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_token_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_delegations: {
        Row: {
          active: boolean
          community_id: string
          created_at: string
          delegate_id: string
          delegator_id: string
          id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          community_id: string
          created_at?: string
          delegate_id: string
          delegator_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          community_id?: string
          created_at?: string
          delegate_id?: string
          delegator_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_delegations_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
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
      distribute_gallery_revenue: {
        Args: { gallery_id_param: string }
        Returns: {
          payout_amount: number
          user_id: string
        }[]
      }
      get_voting_power: {
        Args: { comm_id: string; voter_id: string }
        Returns: number
      }
      handle_dao_membership_payment: {
        Args: {
          community_id_param: string
          fee_amount: number
          user_id_param: string
        }
        Returns: boolean
      }
      increment_vote_count: {
        Args: { is_yes_vote: boolean; proposal_id: string }
        Returns: undefined
      }
      split_event_cost_among_dao_members: {
        Args: { event_id_param: string; total_cost: number }
        Returns: undefined
      }
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
      community_role: ["admin", "curator", "member", "viewer"],
      event_status: ["upcoming", "live", "completed", "cancelled"],
      post_type: ["artwork", "update", "announcement"],
      proposal_status: ["active", "passed", "rejected", "expired"],
    },
  },
} as const
