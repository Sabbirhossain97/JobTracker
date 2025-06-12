export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          position: string;
          job_description: string;
          job_url: string | null;
          status: string;
          date_applied: string | null;
          resume_used: string | null;
          cover_letter_used: string | null;
          notes: string;
          salary: string | null;
          location: string | null;
          contact_person: string | null;
          contact_email: string | null;
          interview_date: string | null;
          follow_up_date: string | null;
          priority: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          position: string;
          job_description: string;
          job_url?: string | null;
          status: string;
          date_applied?: string | null;
          resume_used?: string | null;
          cover_letter_used?: string | null;
          notes: string;
          salary?: string | null;
          location?: string | null;
          contact_person?: string | null;
          contact_email?: string | null;
          interview_date?: string | null;
          follow_up_date?: string | null;
          priority: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          position?: string;
          job_description?: string;
          job_url?: string | null;
          status?: string;
          date_applied?: string | null;
          resume_used?: string | null;
          cover_letter_used?: string | null;
          notes?: string;
          salary?: string | null;
          location?: string | null;
          contact_person?: string | null;
          contact_email?: string | null;
          interview_date?: string | null;
          follow_up_date?: string | null;
          priority?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          file_name: string;
          tags: string[];
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          file_name: string;
          tags?: string[];
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          file_name?: string;
          tags?: string[];
          is_default?: boolean;
          created_at?: string;
        };
      };
      cover_letters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          file_name: string;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          file_name: string;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          file_name?: string;
          tags?: string[];
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}