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
      activity_log: {
        Row: {
          action: string
          company_id: string | null
          created_at: string
          details: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          company_id: string
          created_at: string
          date: string
          deduction: number | null
          employee_id: string
          id: string
          status: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          company_id: string
          created_at?: string
          date?: string
          deduction?: number | null
          employee_id: string
          id?: string
          status?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          company_id?: string
          created_at?: string
          date?: string
          deduction?: number | null
          employee_id?: string
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          city: string | null
          company_name: string
          created_at: string
          email: string
          id: string
          last_login: string | null
          logo_url: string | null
          manager_name: string
          owner_id: string
          phone: string | null
          plan: string | null
          plan_name: string | null
          status: string | null
          trial_end: string | null
          updated_at: string
          wallet: number | null
        }
        Insert: {
          city?: string | null
          company_name: string
          created_at?: string
          email: string
          id?: string
          last_login?: string | null
          logo_url?: string | null
          manager_name?: string
          owner_id: string
          phone?: string | null
          plan?: string | null
          plan_name?: string | null
          status?: string | null
          trial_end?: string | null
          updated_at?: string
          wallet?: number | null
        }
        Update: {
          city?: string | null
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          logo_url?: string | null
          manager_name?: string
          owner_id?: string
          phone?: string | null
          plan?: string | null
          plan_name?: string | null
          status?: string | null
          trial_end?: string | null
          updated_at?: string
          wallet?: number | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          created_at: string
          discount_amount: number | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          max_uses: number | null
          used_count: number | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          used_count?: number | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      delivery_prices: {
        Row: {
          city: string
          id: string
          price: number
          updated_at: string
        }
        Insert: {
          city: string
          id?: string
          price?: number
          updated_at?: string
        }
        Update: {
          city?: string
          id?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      employee_requests: {
        Row: {
          admin_notes: string | null
          amount: number | null
          company_id: string
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          reason: string | null
          start_date: string | null
          status: string | null
          type: string
        }
        Insert: {
          admin_notes?: string | null
          amount?: number | null
          company_id: string
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          reason?: string | null
          start_date?: string | null
          status?: string | null
          type: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number | null
          company_id?: string
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          reason?: string | null
          start_date?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          bank_account: string | null
          bank_name: string | null
          company_id: string
          contract_end: string | null
          contract_type: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          national_id: string | null
          permission_overrides: Json
          permissions: string[] | null
          phone: string | null
          position: string | null
          qualification: string | null
          salary: number | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bank_account?: string | null
          bank_name?: string | null
          company_id: string
          contract_end?: string | null
          contract_type?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          id?: string
          national_id?: string | null
          permission_overrides?: Json
          permissions?: string[] | null
          phone?: string | null
          position?: string | null
          qualification?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bank_account?: string | null
          bank_name?: string | null
          company_id?: string
          contract_end?: string | null
          contract_type?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          national_id?: string | null
          permission_overrides?: Json
          permissions?: string[] | null
          phone?: string | null
          position?: string | null
          qualification?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          company_id: string
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          discount: number | null
          id: string
          invoice_number: string
          items: Json | null
          notes: string | null
          status: string | null
          subtotal: number | null
          tax: number | null
          total: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number | null
          id?: string
          invoice_number: string
          items?: Json | null
          notes?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number | null
          id?: string
          invoice_number?: string
          items?: Json | null
          notes?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          company_id: string
          created_at: string
          customer_city: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          items: Json | null
          notes: string | null
          payment_method: string | null
          payment_proof_url: string | null
          status: string | null
          total: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          customer_city?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          customer_city?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean | null
          created_at: string
          features: string[] | null
          id: string
          max_products: number | null
          max_stores: number | null
          max_users: number | null
          name: string
          name_en: string | null
          period: string | null
          price: number
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          features?: string[] | null
          id?: string
          max_products?: number | null
          max_stores?: number | null
          max_users?: number | null
          name: string
          name_en?: string | null
          period?: string | null
          price?: number
        }
        Update: {
          active?: boolean | null
          created_at?: string
          features?: string[] | null
          id?: string
          max_products?: number | null
          max_stores?: number | null
          max_users?: number | null
          name?: string
          name_en?: string | null
          period?: string | null
          price?: number
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          buy_price: number | null
          code: string | null
          company_id: string
          created_at: string
          id: string
          image_url: string | null
          min_stock: number | null
          name: string
          quantity: number | null
          sell_price: number | null
          type: string | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          barcode?: string | null
          buy_price?: number | null
          code?: string | null
          company_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          min_stock?: number | null
          name: string
          quantity?: number | null
          sell_price?: number | null
          type?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          barcode?: string | null
          buy_price?: number | null
          code?: string | null
          company_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          min_stock?: number | null
          name?: string
          quantity?: number | null
          sell_price?: number | null
          type?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          product_id: string | null
          quantity: number
          reason: string | null
          type: string
          warehouse_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          quantity?: number
          reason?: string | null
          type: string
          warehouse_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          quantity?: number
          reason?: string | null
          type?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_requests: {
        Row: {
          admin_notes: string | null
          company_id: string
          created_at: string
          id: string
          payment_method: string | null
          plan_id: string | null
          plan_name: string
          price: number
          proof_url: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          company_id: string
          created_at?: string
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          plan_name: string
          price?: number
          proof_url?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          company_id?: string
          created_at?: string
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          plan_name?: string
          price?: number
          proof_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_requests_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          company_id: string
          created_at: string
          end_date: string | null
          id: string
          plan_id: string | null
          plan_name: string
          price: number
          start_date: string
          status: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string | null
          plan_name: string
          price?: number
          start_date?: string
          status?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string | null
          plan_name?: string
          price?: number
          start_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          city: string | null
          company_id: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          city?: string | null
          company_id: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          city?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          due_date: string | null
          employee_id: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          employee_id?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          employee_id?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
      wallet_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          cancel_reason: string
          company_id: string
          created_at: string
          id: string
          method: string | null
          notes: string | null
          proof_url: string | null
          receipt_required: boolean
          receipt_reviewed_at: string | null
          receipt_uploaded_at: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount?: number
          cancel_reason?: string
          company_id: string
          created_at?: string
          id?: string
          method?: string | null
          notes?: string | null
          proof_url?: string | null
          receipt_required?: boolean
          receipt_reviewed_at?: string | null
          receipt_uploaded_at?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          cancel_reason?: string
          company_id?: string
          created_at?: string
          id?: string
          method?: string | null
          notes?: string | null
          proof_url?: string | null
          receipt_required?: boolean
          receipt_reviewed_at?: string | null
          receipt_uploaded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          description: string | null
          id: string
          status: string | null
          type: string
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          type?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_default: boolean | null
          location: string | null
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          location?: string | null
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          location?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      employee_belongs_to_company: {
        Args: { _company_id: string }
        Returns: boolean
      }
      employee_has_action_access: {
        Args: { _action: string; _company_id: string; _section: string }
        Returns: boolean
      }
      employee_has_section_access: {
        Args: { _company_id: string; _section: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_owner: { Args: { _company_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "company" | "employee"
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
      app_role: ["admin", "company", "employee"],
    },
  },
} as const
