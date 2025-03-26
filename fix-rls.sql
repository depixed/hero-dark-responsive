-- OPTION 1: Temporarily disable RLS for testing
-- This will allow all operations without authentication checks
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- OPTION 2: Enable RLS with proper policies
-- Uncomment these lines when ready to implement proper security

-- First enable RLS
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
-- DROP POLICY IF EXISTS "enable_insert_for_all" ON leads;
-- DROP POLICY IF EXISTS "enable_select_for_authenticated" ON leads;
-- DROP POLICY IF EXISTS "Allow anonymous users to insert leads" ON leads;
-- DROP POLICY IF EXISTS "Allow authenticated users to view leads" ON leads;
-- DROP POLICY IF EXISTS "Allow authenticated users to delete leads" ON leads;

-- Create policy that allows anyone to insert leads (both anonymous and authenticated users)
-- CREATE POLICY "Allow anyone to insert leads" 
--   ON leads 
--   FOR INSERT 
--   WITH CHECK (true);

-- Create policy that allows only authenticated users to view leads
-- CREATE POLICY "Allow authenticated users to view leads" 
--   ON leads 
--   FOR SELECT 
--   USING (auth.role() = 'authenticated');

-- Create policy that allows only authenticated users to delete leads
-- CREATE POLICY "Allow authenticated users to delete leads" 
--   ON leads 
--   FOR DELETE 
--   USING (auth.role() = 'authenticated');

-- IMPORTANT: In production, you should restrict these policies further based on user roles
-- For example, to only allow admin users to view and delete leads:
-- CREATE POLICY "Allow admin users to view leads" 
--   ON leads 
--   FOR SELECT 
--   USING (auth.jwt() ->> 'email' = 'admin@yourdomain.com');
-- 
-- CREATE POLICY "Allow admin users to delete leads" 
--   ON leads 
--   FOR DELETE 
--   USING (auth.jwt() ->> 'email' = 'admin@yourdomain.com'); 