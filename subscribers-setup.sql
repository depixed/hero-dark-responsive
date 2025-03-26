-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS policies
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert subscribers
CREATE POLICY "Allow anonymous insert" ON subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to view subscribers
CREATE POLICY "Allow authenticated users to view" ON subscribers
  FOR SELECT
  TO authenticated
  USING (true); 