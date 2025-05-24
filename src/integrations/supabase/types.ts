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
      ai_mask_results: {
        Row: {
          color_palette: string[]
          created_at: string
          id: string
          image_url: string
          layout: Json
          prompt: string
          reference_image_url: string | null
          safe_zone: Json
          storage_path: string | null
          style: string
          style_hint_image_url: string | null
          transparency_validated: boolean | null
          updated_at: string
          user_id: string | null
          wallet_base_image_url: string | null
        }
        Insert: {
          color_palette: string[]
          created_at?: string
          id?: string
          image_url: string
          layout: Json
          prompt: string
          reference_image_url?: string | null
          safe_zone: Json
          storage_path?: string | null
          style: string
          style_hint_image_url?: string | null
          transparency_validated?: boolean | null
          updated_at?: string
          user_id?: string | null
          wallet_base_image_url?: string | null
        }
        Update: {
          color_palette?: string[]
          created_at?: string
          id?: string
          image_url?: string
          layout?: Json
          prompt?: string
          reference_image_url?: string | null
          safe_zone?: Json
          storage_path?: string | null
          style?: string
          style_hint_image_url?: string | null
          transparency_validated?: boolean | null
          updated_at?: string
          user_id?: string | null
          wallet_base_image_url?: string | null
        }
        Relationships: []
      }
      ai_requests: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          layer_type: string | null
          prompt: string | null
          status: string | null
          style_result: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          layer_type?: string | null
          prompt?: string | null
          status?: string | null
          style_result?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          layer_type?: string | null
          prompt?: string | null
          status?: string | null
          style_result?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      image_feedback: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          id: string
          image_url: string
          prompt: string
          rating: number
          tags: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          image_url: string
          prompt: string
          rating: number
          tags?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          image_url?: string
          prompt?: string
          rating?: number
          tags?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      nfts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          metadata_uri: string | null
          mint_address: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          metadata_uri?: string | null
          mint_address?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          metadata_uri?: string | null
          mint_address?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_skins: {
        Row: {
          created_at: string
          id: string
          style_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          style_data: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          style_data?: Json
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      feedback_analytics: {
        Row: {
          average_rating: number | null
          feedback_count: number | null
          feedback_texts: string[] | null
          prompt: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      refresh_feedback_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
