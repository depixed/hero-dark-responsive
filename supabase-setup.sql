-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  answers JSONB NOT NULL
);

-- Create subscribers table for early access signups
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'early_access'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to view leads" ON leads;
DROP POLICY IF EXISTS "Allow anyone to insert leads" ON leads;
DROP POLICY IF EXISTS "Enable insert for all users" ON leads;
DROP POLICY IF EXISTS "public_insert_policy" ON leads;
DROP POLICY IF EXISTS "allow_anonymous_inserts" ON leads;
DROP POLICY IF EXISTS "allow_admin_select" ON leads;
DROP POLICY IF EXISTS "public_insert_fallback" ON leads;
DROP POLICY IF EXISTS "allow_inserts_for_everyone" ON leads;
DROP POLICY IF EXISTS "allow_select_for_authenticated" ON leads;
DROP POLICY IF EXISTS "allow_delete_for_authenticated" ON leads;

-- POLICY APPROACH 1: USING ROLES
-- Allow any authenticated user (including anonymous) to insert leads
CREATE POLICY "allow_inserts_for_everyone" 
  ON leads 
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- Allow only authenticated users to view leads
CREATE POLICY "allow_select_for_authenticated" 
  ON leads 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow only authenticated users to delete leads
CREATE POLICY "allow_delete_for_authenticated" 
  ON leads 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Subscribers table policies
-- Allow anyone to submit their email
CREATE POLICY "allow_inserts_for_subscribers" 
  ON subscribers 
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- Allow only authenticated users to view subscribers
CREATE POLICY "allow_select_for_subscribers" 
  ON subscribers 
  FOR SELECT 
  TO authenticated
  USING (true);

-- POLICY APPROACH 2: SIMPLER OPTION (ALTERNATIVE)
-- Uncomment these if the above policies don't work
-- This completely opens up inserts to anyone (even unauthenticated)
-- CREATE POLICY "unrestricted_inserts" 
--   ON leads 
--   FOR INSERT 
--   WITH CHECK (true);

-- For admin-only access to view leads, use this policy instead
-- CREATE POLICY "admin_only_select" 
--   ON leads 
--   FOR SELECT 
--   USING (auth.jwt() ->> 'email' = 'admin@incorpify.com');

-- For admin-only access to delete leads, use this policy instead
-- CREATE POLICY "admin_only_delete" 
--   ON leads 
--   FOR DELETE 
--   USING (auth.jwt() ->> 'email' = 'admin@incorpify.com');

-- TROUBLESHOOTING: temporarily disable RLS completely when testing
-- Comment out this line in production:
-- ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Create admin user if you haven't already (run this separately)
-- Uncomment and replace values as needed
-- 
-- SELECT supabase_auth.create_user(
--   '{
--     "email": "admin@incorpify.com",
--     "password": "Admin123!",
--     "email_confirm": true,
--     "user_metadata": {
--       "role": "admin"
--     }
--   }'::jsonb
-- ); 