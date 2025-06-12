/*
  # Authentication and User Management Schema

  1. New Tables
    - `applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `company_name` (text)
      - `position` (text)
      - `job_description` (text)
      - `job_url` (text, nullable)
      - `status` (text)
      - `date_applied` (date, nullable)
      - `resume_used` (text, nullable)
      - `cover_letter_used` (text, nullable)
      - `notes` (text)
      - `salary` (text, nullable)
      - `location` (text, nullable)
      - `contact_person` (text, nullable)
      - `contact_email` (text, nullable)
      - `interview_date` (timestamptz, nullable)
      - `follow_up_date` (date, nullable)
      - `priority` (text, default 'medium')
      - `tags` (text array, default empty array)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `resumes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `file_name` (text)
      - `tags` (text array, default empty array)
      - `is_default` (boolean, default false)
      - `created_at` (timestamptz, default now())

    - `cover_letters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `file_name` (text)
      - `tags` (text array, default empty array)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  position text NOT NULL,
  job_description text DEFAULT '',
  job_url text,
  status text DEFAULT 'interested',
  date_applied date,
  resume_used text,
  cover_letter_used text,
  notes text DEFAULT '',
  salary text,
  location text,
  contact_person text,
  contact_email text,
  interview_date timestamptz,
  follow_up_date date,
  priority text DEFAULT 'medium',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  file_name text DEFAULT '',
  tags text[] DEFAULT '{}',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Cover letters table
CREATE TABLE IF NOT EXISTS cover_letters (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  file_name text DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

-- Applications policies
CREATE POLICY "Users can view own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON applications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Resumes policies
CREATE POLICY "Users can view own resumes"
  ON resumes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
  ON resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON resumes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Cover letters policies
CREATE POLICY "Users can view own cover letters"
  ON cover_letters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cover letters"
  ON cover_letters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cover letters"
  ON cover_letters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cover letters"
  ON cover_letters
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications(user_id);
CREATE INDEX IF NOT EXISTS applications_status_idx ON applications(status);
CREATE INDEX IF NOT EXISTS applications_created_at_idx ON applications(created_at);
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON resumes(user_id);
CREATE INDEX IF NOT EXISTS cover_letters_user_id_idx ON cover_letters(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();