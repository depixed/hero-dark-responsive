-- Create a secure view to expose user information with proper permissions
-- This allows accessing user data without direct access to auth.users

-- Create a view to expose limited user information
CREATE OR REPLACE VIEW public.users_view AS
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.confirmed_at as email_confirmed_at,
  au.last_sign_in_at,
  'user' as role,
  p.id as profile_id
FROM auth.users au
JOIN public.profiles p ON p.user_id = au.id;

-- Set RLS on the view to only allow admin access
ALTER VIEW public.users_view SECURITY INVOKER;

-- You need to create an RLS policy to determine who can access this view
-- For example, to restrict to admins only:
CREATE POLICY "Only admins can view users_view"
ON public.users_view
FOR SELECT
USING (
  -- This is a simplified check. You need to implement a proper admin role system.
  -- For example, you might have an "is_admin" field in profiles or a separate admins table
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email IN ('admin@example.com', 'your-admin-email@domain.com')
  )
);

-- Optionally add a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('admin@example.com', 'your-admin-email@domain.com')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 