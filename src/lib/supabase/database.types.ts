export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: Database["public"]["Enums"]["role_color"];
          order_index: number;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          color: Database["public"]["Enums"]["role_color"];
          order_index: number;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: Database["public"]["Enums"]["role_color"];
          order_index?: number;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      weeks: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id?: string;
          start_date: string;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_date?: string;
          data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      reorder_roles: {
        Args: { role_ids: string[] };
        Returns: Database["public"]["Tables"]["roles"]["Row"][];
      };
    };
    Enums: {
      role_color:
        | "teal"
        | "amber"
        | "rose"
        | "violet"
        | "emerald"
        | "orange"
        | "sky"
        | "fuchsia"
        | "blue";
    };
    CompositeTypes: Record<string, never>;
  };
};
