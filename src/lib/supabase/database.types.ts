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
          color: string;
          order_index: number;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          color: string;
          order_index: number;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
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
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
