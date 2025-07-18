export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
      element_categories: {
        Row: {
          created_at: string | null
          customization_types: Json | null
          default_library_path: string | null
          description: string | null
          icon_color: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customization_types?: Json | null
          default_library_path?: string | null
          description?: string | null
          icon_color?: string | null
          id: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customization_types?: Json | null
          default_library_path?: string | null
          description?: string | null
          icon_color?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
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
      icon_variants: {
        Row: {
          created_at: string | null
          element_ids: string[]
          group_name: string
          id: string
          storage_file_name: string
          storage_path: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          element_ids: string[]
          group_name: string
          id?: string
          storage_file_name: string
          storage_path: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          element_ids?: string[]
          group_name?: string
          id?: string
          storage_file_name?: string
          storage_path?: string
          updated_at?: string | null
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
      user_custom_icons: {
        Row: {
          custom_storage_path: string
          element_id: string
          id: string
          is_active: boolean | null
          original_storage_path: string
          upload_timestamp: string | null
          user_id: string | null
        }
        Insert: {
          custom_storage_path: string
          element_id: string
          id?: string
          is_active?: boolean | null
          original_storage_path: string
          upload_timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          custom_storage_path?: string
          element_id?: string
          id?: string
          is_active?: boolean | null
          original_storage_path?: string
          upload_timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      wallet_elements: {
        Row: {
          asset_library_path: string | null
          category: string | null
          created_at: string
          custom_props: Json
          customizable: boolean
          description: string
          icon_group: string | null
          id: string
          is_customizable_icon: boolean | null
          name: string
          parent_element: string | null
          position: string | null
          responsive_settings: Json | null
          screen: string
          selector: string | null
          storage_file_name: string | null
          type: string
          updated_at: string
          z_index: number | null
        }
        Insert: {
          asset_library_path?: string | null
          category?: string | null
          created_at?: string
          custom_props?: Json
          customizable?: boolean
          description: string
          icon_group?: string | null
          id: string
          is_customizable_icon?: boolean | null
          name: string
          parent_element?: string | null
          position?: string | null
          responsive_settings?: Json | null
          screen: string
          selector?: string | null
          storage_file_name?: string | null
          type: string
          updated_at?: string
          z_index?: number | null
        }
        Update: {
          asset_library_path?: string | null
          category?: string | null
          created_at?: string
          custom_props?: Json
          customizable?: boolean
          description?: string
          icon_group?: string | null
          id?: string
          is_customizable_icon?: boolean | null
          name?: string
          parent_element?: string | null
          position?: string | null
          responsive_settings?: Json | null
          screen?: string
          selector?: string | null
          storage_file_name?: string | null
          type?: string
          updated_at?: string
          z_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_elements_parent_element_fkey"
            columns: ["parent_element"]
            isOneToOne: false
            referencedRelation: "wallet_elements"
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
      get_final_icon_path: {
        Args: { p_element_id: string; p_user_id?: string }
        Returns: string
      }
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
    Enums: {},
  },
} as const
