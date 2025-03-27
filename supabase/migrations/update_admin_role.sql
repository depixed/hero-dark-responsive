-- Update the metadata for admin@incorpify.ai to include the admin role
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@incorpify.ai';

-- Create or replace the users_view to include the role
DROP VIEW IF EXISTS public.users_view;

CREATE VIEW public.users_view AS
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data,
  email_confirmed_at,
  (raw_user_meta_data->>'role')::text as role
FROM auth.users;

-- Grant appropriate permissions to the view
GRANT SELECT ON public.users_view TO authenticated;
GRANT SELECT ON public.users_view TO service_role; 