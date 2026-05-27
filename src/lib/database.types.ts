export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          total_challenges_completed: number;
          total_hints_used: number;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          total_challenges_completed?: number;
          total_hints_used?: number;
        };
        Update: {
          email?: string;
          total_challenges_completed?: number;
          total_hints_used?: number;
        };
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          stack: "javascript" | "typescript";
          level: "beginner" | "intermediate";
          client_briefing: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          stack: "javascript" | "typescript";
          level: "beginner" | "intermediate";
          client_briefing: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          stack?: "javascript" | "typescript";
          level?: "beginner" | "intermediate";
          client_briefing?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          status: "in_progress" | "completed" | "abandoned";
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          status?: "in_progress" | "completed" | "abandoned";
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          status?: "in_progress" | "completed" | "abandoned";
          completed_at?: string | null;
        };
      };
      hints_used: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          hint_level: 1 | 2 | 3;
          used_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          hint_level: 1 | 2 | 3;
          used_at?: string;
        };
        Update: never;
      };
      code_submissions: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          code: string;
          submitted_at: string;
          review_response: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          code: string;
          submitted_at?: string;
          review_response?: string | null;
        };
        Update: {
          review_response?: string | null;
        };
      };
    };
  };
};
