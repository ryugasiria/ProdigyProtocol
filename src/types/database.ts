export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          website: string | null;
          role: 'guest' | 'user' | 'premium' | 'admin';
          is_verified: boolean;
          preferences: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          role?: 'guest' | 'user' | 'premium' | 'admin';
          is_verified?: boolean;
          preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          role?: 'guest' | 'user' | 'premium' | 'admin';
          is_verified?: boolean;
          preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      social_links: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          username: string | null;
          url: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          username?: string | null;
          url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: string;
          username?: string | null;
          url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token: string | null;
          ip_address: string | null;
          user_agent: string | null;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
          last_activity: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          last_activity?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_token?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          last_activity?: string;
        };
      };
      // Professional development tables
      professional_assessments: {
        Row: {
          id: string;
          user_id: string | null;
          assessment_type: string;
          assessment_name: string;
          results: Record<string, any>;
          score: number | null;
          completed_date: string | null;
          expires_date: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          assessment_type: string;
          assessment_name: string;
          results: Record<string, any>;
          score?: number | null;
          completed_date?: string | null;
          expires_date?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          assessment_type?: string;
          assessment_name?: string;
          results?: Record<string, any>;
          score?: number | null;
          completed_date?: string | null;
          expires_date?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      career_goals: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          description: string | null;
          category: string;
          priority: string;
          timeline: string;
          target_date: string | null;
          current_status: string;
          progress_percentage: number;
          success_metrics: string[] | null;
          obstacles: string[] | null;
          resources_needed: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          description?: string | null;
          category?: string;
          priority?: string;
          timeline?: string;
          target_date?: string | null;
          current_status?: string;
          progress_percentage?: number;
          success_metrics?: string[] | null;
          obstacles?: string[] | null;
          resources_needed?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          description?: string | null;
          category?: string;
          priority?: string;
          timeline?: string;
          target_date?: string | null;
          current_status?: string;
          progress_percentage?: number;
          success_metrics?: string[] | null;
          obstacles?: string[] | null;
          resources_needed?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      // Add other professional development tables as needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'guest' | 'user' | 'premium' | 'admin';
    };
  };
}