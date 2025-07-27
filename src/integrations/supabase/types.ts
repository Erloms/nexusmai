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
      agent_customization_projects: {
        Row: {
          category: string
          contact_info: string | null
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean
          price_info: string | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          contact_info?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          price_info?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          contact_info?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          price_info?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          avatar_url: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          creator_name: string | null
          credits_per_message: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          model: string | null
          name: string
          rating: number | null
          system_prompt: string | null
          tags: string[] | null
          updated_at: string | null
          users_count: number | null
        }
        Insert: {
          avatar_url?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          creator_name?: string | null
          credits_per_message?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          model?: string | null
          name: string
          rating?: number | null
          system_prompt?: string | null
          tags?: string[] | null
          updated_at?: string | null
          users_count?: number | null
        }
        Update: {
          avatar_url?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          creator_name?: string | null
          credits_per_message?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          model?: string | null
          name?: string
          rating?: number | null
          system_prompt?: string | null
          tags?: string[] | null
          updated_at?: string | null
          users_count?: number | null
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          conversation_type: string
          created_at: string | null
          id: string
          messages: Json | null
          project_id: string | null
          user_id: string
        }
        Insert: {
          conversation_type: string
          created_at?: string | null
          id?: string
          messages?: Json | null
          project_id?: string | null
          user_id: string
        }
        Update: {
          conversation_type?: string
          created_at?: string | null
          id?: string
          messages?: Json | null
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_website_projects: {
        Row: {
          created_at: string
          demo_url: string | null
          description: string | null
          icon_name: string
          id: string
          is_active: boolean
          long_description: string | null
          screenshot_url: string | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          demo_url?: string | null
          description?: string | null
          icon_name: string
          id?: string
          is_active?: boolean
          long_description?: string | null
          screenshot_url?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          demo_url?: string | null
          description?: string | null
          icon_name?: string
          id?: string
          is_active?: boolean
          long_description?: string | null
          screenshot_url?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_public: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          credits_earned: number
          id: string
          user_id: string
        }
        Insert: {
          checkin_date: string
          created_at?: string
          credits_earned?: number
          id?: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          credits_earned?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          duration_days: number | null;
          type: string; // 'annual', 'lifetime', 'agent', 'free'
          features: Json | null; // JSONB for features array
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          duration_days?: number | null;
          type: string;
          features?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          duration_days?: number | null;
          type?: string;
          features?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          plan_id: string | null; // UUID for membership_plans
          amount: number;
          status: string; // 'pending', 'paid', 'failed'
          payment_method: string | null;
          payment_id: string | null;
          order_type: string | null;
          subject: string | null;
          created_at: string | null;
          updated_at: string | null;
          order_number: string | null; // Added order_number
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          plan_id?: string | null;
          amount: number;
          status?: string;
          payment_method?: string | null;
          payment_id?: string | null;
          order_type?: string | null;
          subject?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          order_number?: string | null; // Added order_number
        };
        Update: {
          id?: string;
          user_id?: string | null;
          plan_id?: string | null;
          amount?: number;
          status?: string;
          payment_method?: string | null;
          payment_id?: string | null;
          order_type?: string | null;
          subject?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          order_number?: string | null; // Added order_number
        };
        Relationships: [
          {
            foreignKeyName: "orders_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "membership_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users"; // Assuming auth.users
            referencedColumns: ["id"];
          },
        ];
      };
      payment_configs: {
        Row: {
          id: string;
          alipay_app_id: string;
          alipay_private_key: string;
          alipay_public_key: string;
          alipay_gateway_url: string;
          notify_url: string;
          return_url: string;
          created_at: string;
          updated_at: string;
          is_sandbox: boolean | null; // Added is_sandbox
          app_public_key: string | null; // Added app_public_key
        };
        Insert: {
          id?: string;
          alipay_app_id: string;
          alipay_private_key: string;
          alipay_public_key: string;
          alipay_gateway_url?: string;
          notify_url: string;
          return_url: string;
          created_at?: string;
          updated_at?: string;
          is_sandbox?: boolean | null; // Added is_sandbox
          app_public_key?: string | null; // Added app_public_key
        };
        Update: {
          alipay_app_id?: string;
          alipay_private_key?: string;
          alipay_public_key?: string;
          alipay_gateway_url?: string;
          notify_url?: string;
          return_url?: string;
          created_at?: string;
          updated_at?: string;
          is_sandbox?: boolean | null; // Added is_sandbox
          app_public_key?: string | null; // Added app_public_key
        };
        Relationships: [];
      };
      payment_orders: {
        Row: {
          amount: number
          body: string | null
          created_at: string | null
          id: string
          order_id: string
          order_type: string
          status: string
          subject: string
          trade_no: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          body?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          order_type: string
          status?: string
          subject: string
          trade_no?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          body?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          order_type?: string
          status?: string
          subject?: string
          trade_no?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ppt_generations: {
        Row: {
          created_at: string | null
          id: string
          outline_markdown: string | null
          ppt_url: string | null
          project_id: string
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          outline_markdown?: string | null
          ppt_url?: string | null
          project_id: string
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          outline_markdown?: string | null
          ppt_url?: string | null
          project_id?: string
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ppt_generations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          membership_expires_at: string | null
          membership_type: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          membership_expires_at?: string | null
          membership_type?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          membership_expires_at?: string | null
          membership_type?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          data: Json | null
          description: string | null
          id: string
          phase: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          phase?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          phase?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          created_at: string
          cron_expression: string
          id: string
          is_active: boolean
          model: string
          name: string
          system_prompt: string | null
          task_prompt: string
          tools: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cron_expression: string
          id?: string
          is_active?: boolean
          model: string
          name: string
          system_prompt?: string | null
          task_prompt: string
          tools?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cron_expression?: string
          id?: string
          is_active?: boolean
          model?: string
          name?: string
          system_prompt?: string | null
          task_prompt?: string
          tools?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      task_executions: {
        Row: {
          duration_ms: number | null
          error_message: string | null
          executed_at: string
          id: string
          result: Json | null
          status: string
          task_id: string
          user_id: string
        }
        Insert: {
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string
          id?: string
          result?: Json | null
          status: string
          task_id: string
          user_id: string
        }
        Update: {
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string
          id?: string
          result?: Json | null
          status?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_executions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "scheduled_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_content_templates: {
        Row: {
          created_at: string
          description: string | null
          elements: string[] | null
          hooks: string[] | null
          id: string
          name: string
          sample_text: string | null
          style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          elements?: string[] | null
          hooks?: string[] | null
          id?: string
          name: string
          sample_text?: string | null
          style: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          elements?: string[] | null
          hooks?: string[] | null
          id?: string
          name?: string
          sample_text?: string | null
          style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string | null
          credits: number
          id: string
          membership_expires_at: string | null
          membership_type: string | null
          total_earned: number
          total_spent: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits?: number
          id?: string
          membership_expires_at?: string | null
          membership_type?: string | null
          total_earned?: number
          total_spent?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits?: number
          id?: string
          membership_expires_at?: string | null
          membership_type?: string | null
          total_earned?: number
          total_spent?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_custom_tools: {
        Row: {
          api_url: string
          body_template: string | null
          created_at: string
          enabled: boolean
          headers: Json | null
          id: string
          method: string
          name: string
          result_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_url: string
          body_template?: string | null
          created_at?: string
          enabled?: boolean
          headers?: Json | null
          id?: string
          method?: string
          name: string
          result_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_url?: string
          body_template?: string | null
          created_at?: string
          enabled?: boolean
          headers?: Json | null
          id?: string
          method?: string
          name?: string
          result_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_workspaces: {
        Row: {
          created_at: string
          generated_content: Json | null
          id: string
          topics: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_content?: Json | null
          id?: string
          topics?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_content?: Json | null
          id?: string
          topics?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_credits: {
        Args: { p_user_id: string; p_credits: number; p_description: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      activate_membership: {
        Args: { p_user_id: string; p_plan_id: string; p_order_id: string | null }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "user"
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