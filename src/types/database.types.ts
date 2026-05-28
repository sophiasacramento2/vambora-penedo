export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          wallet_balance: number
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          wallet_balance?: number
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          wallet_balance?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedSource: "auth"
          }
        ]
      }
      routes: {
        Row: {
          id: string
          name: string
          type: "bus" | "van" | "ferry" | "boat"
          origin: string
          destination: string
          fare: number
          duration_min: number | null
          frequency: string | null
          payment_methods: string[]
          polyline: Json | null
          color_token: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: "bus" | "van" | "ferry" | "boat"
          origin: string
          destination: string
          fare: number
          duration_min?: number | null
          frequency?: string | null
          payment_methods?: string[]
          polyline?: Json | null
          color_token?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: "bus" | "van" | "ferry" | "boat"
          origin?: string
          destination?: string
          fare?: number
          duration_min?: number | null
          frequency?: string | null
          payment_methods?: string[]
          polyline?: Json | null
          color_token?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      stops: {
        Row: {
          id: string
          route_id: string
          name: string
          lat: number
          lng: number
          sequence: number
          created_at: string
        }
        Insert: {
          id?: string
          route_id: string
          name: string
          lat: number
          lng: number
          sequence: number
          created_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          name?: string
          lat?: number
          lng?: number
          sequence?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stops_route_id_fkey"
            columns: ["route_id"]
            referencedRelation: "routes"
            referencedSource: "public"
          }
        ]
      }
      schedules: {
        Row: {
          id: string
          route_id: string
          day_type: "weekday" | "saturday" | "sunday_holiday"
          departure_time: string
          created_at: string
        }
        Insert: {
          id?: string
          route_id: string
          day_type: "weekday" | "saturday" | "sunday_holiday"
          departure_time: string
          created_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          day_type?: "weekday" | "saturday" | "sunday_holiday"
          departure_time?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_route_id_fkey"
            columns: ["route_id"]
            referencedRelation: "routes"
            referencedSource: "public"
          }
        ]
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          route_id: string
          schedule_id: string
          seats: number
          total_amount: number
          payment_method: "cash" | "card" | "pix"
          status: "active" | "cancelled" | "completed"
          reserved_at: string
          cancelled_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          route_id: string
          schedule_id: string
          seats?: number
          total_amount: number
          payment_method: "cash" | "card" | "pix"
          status?: "active" | "cancelled" | "completed"
          reserved_at?: string
          cancelled_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          route_id?: string
          schedule_id?: string
          seats?: number
          total_amount?: number
          payment_method?: "cash" | "card" | "pix"
          status?: "active" | "cancelled" | "completed"
          reserved_at?: string
          cancelled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_route_id_fkey"
            columns: ["route_id"]
            referencedRelation: "routes"
            referencedSource: "public"
          },
          {
            foreignKeyName: "reservations_schedule_id_fkey"
            columns: ["schedule_id"]
            referencedRelation: "schedules"
            referencedSource: "public"
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedSource: "public"
          }
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          route_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          route_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          route_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_route_id_fkey"
            columns: ["route_id"]
            referencedRelation: "routes"
            referencedSource: "public"
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedSource: "public"
          }
        ]
      }
      alerts: {
        Row: {
          id: string
          route_id: string | null
          severity: "info" | "warning" | "danger"
          title: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          route_id?: string | null
          severity?: "info" | "warning" | "danger"
          title: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          route_id?: string | null
          severity?: "info" | "warning" | "danger"
          title?: string
          body?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_route_id_fkey"
            columns: ["route_id"]
            referencedRelation: "routes"
            referencedSource: "public"
          }
        ]
      }
      user_alerts_read: {
        Row: {
          id: string
          user_id: string
          alert_id: string
          read_at: string
        }
        Insert: {
          id?: string
          user_id: string
          alert_id: string
          read_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          alert_id?: string
          read_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_alerts_read_alert_id_fkey"
            columns: ["alert_id"]
            referencedRelation: "alerts"
            referencedSource: "public"
          },
          {
            foreignKeyName: "user_alerts_read_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedSource: "public"
          }
        ]
      }
      flow_events: {
        Row: {
          id: string
          user_id: string | null
          route_id: string | null
          destination: string | null
          occurred_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          route_id?: string | null
          destination?: string | null
          occurred_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          route_id?: string | null
          destination?: string | null
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_events_route_id_fkey"
            columns: ["route_id"]
            referencedRelation: "routes"
            referencedSource: "public"
          },
          {
            foreignKeyName: "flow_events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedSource: "public"
          }
        ]
      }
      wallet_entries: {
        Row: {
          id: string
          user_id: string
          description: string
          transport_type: "bus" | "van" | "ferry" | "boat" | null
          amount: number
          direction: "debit" | "credit"
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          transport_type?: "bus" | "van" | "ferry" | "boat" | null
          amount: number
          direction: "debit" | "credit"
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          transport_type?: "bus" | "van" | "ferry" | "boat" | null
          amount?: number
          direction?: "debit" | "credit"
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_entries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedSource: "public"
          }
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
      [_ in never]: never
    }
  }
}
