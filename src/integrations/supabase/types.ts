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
      ai_pet_behaviors: {
        Row: {
          animation_data: Json
          behavior_name: string
          created_at: string
          duration_ms: number | null
          id: string
          is_active: boolean | null
          trigger_conditions: Json
        }
        Insert: {
          animation_data: Json
          behavior_name: string
          created_at?: string
          duration_ms?: number | null
          id?: string
          is_active?: boolean | null
          trigger_conditions: Json
        }
        Update: {
          animation_data?: Json
          behavior_name?: string
          created_at?: string
          duration_ms?: number | null
          id?: string
          is_active?: boolean | null
          trigger_conditions?: Json
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
      generated_images: {
        Row: {
          created_at: string | null
          generation_mode: string
          id: string
          metadata: Json | null
          prompt: string
          public_url: string
          storage_path: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          generation_mode: string
          id?: string
          metadata?: Json | null
          prompt: string
          public_url: string
          storage_path: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          generation_mode?: string
          id?: string
          metadata?: Json | null
          prompt?: string
          public_url?: string
          storage_path?: string
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
      style_library: {
        Row: {
          ai_analysis: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          inspiration_image_url: string | null
          is_featured: boolean | null
          like_count: number | null
          preview_image_url: string | null
          style_data: Json
          style_name: string
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inspiration_image_url?: string | null
          is_featured?: boolean | null
          like_count?: number | null
          preview_image_url?: string | null
          style_data: Json
          style_name: string
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inspiration_image_url?: string | null
          is_featured?: boolean | null
          like_count?: number | null
          preview_image_url?: string | null
          style_data?: Json
          style_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      wallet_layout_layers: {
        Row: {
          created_at: string
          elements: Json
          id: string
          layer_name: string
          layer_order: number
          metadata: Json | null
          updated_at: string
          wallet_layout_id: string
        }
        Insert: {
          created_at?: string
          elements?: Json
          id?: string
          layer_name: string
          layer_order?: number
          metadata?: Json | null
          updated_at?: string
          wallet_layout_id: string
        }
        Update: {
          created_at?: string
          elements?: Json
          id?: string
          layer_name?: string
          layer_order?: number
          metadata?: Json | null
          updated_at?: string
          wallet_layout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_layout_layers_wallet_layout_id_fkey"
            columns: ["wallet_layout_id"]
            isOneToOne: false
            referencedRelation: "wallet_layouts"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_layouts: {
        Row: {
          ai_analysis: Json | null
          ai_style_applied: boolean | null
          created_at: string
          dimensions: Json
          id: string
          inspiration_image_url: string | null
          layout_data: Json
          screen: string
          style_library_id: string | null
          updated_at: string
          wallet_id: string
          wallet_type: string
        }
        Insert: {
          ai_analysis?: Json | null
          ai_style_applied?: boolean | null
          created_at?: string
          dimensions: Json
          id?: string
          inspiration_image_url?: string | null
          layout_data: Json
          screen: string
          style_library_id?: string | null
          updated_at?: string
          wallet_id: string
          wallet_type?: string
        }
        Update: {
          ai_analysis?: Json | null
          ai_style_applied?: boolean | null
          created_at?: string
          dimensions?: Json
          id?: string
          inspiration_image_url?: string | null
          layout_data?: Json
          screen?: string
          style_library_id?: string | null
          updated_at?: string
          wallet_id?: string
          wallet_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_layouts_style_library_id_fkey"
            columns: ["style_library_id"]
            isOneToOne: false
            referencedRelation: "style_library"
            referencedColumns: ["id"]
          },
        ]
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
