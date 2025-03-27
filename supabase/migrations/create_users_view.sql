-- First drop the existing view if it exists
DROP VIEW IF EXISTS public.users_view;

-- Create a view that exposes selected fields from auth.users
CREATE VIEW public.users_view AS
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data,
  email_confirmed_at
FROM auth.users;

-- Grant appropriate permissions to the view
GRANT SELECT ON public.users_view TO authenticated;
GRANT SELECT ON public.users_view TO service_role; 