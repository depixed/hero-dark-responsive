-- Create a view to show all users with their profile information
CREATE OR REPLACE VIEW public.users_view AS
SELECT 
  au.id,
  au.email,
  au.role,
  au.created_at,
  p.full_name,
  p.avatar_url,
  p.phone
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
ORDER BY au.created_at DESC;

-- Grant appropriate permissions
ALTER VIEW public.users_view OWNER TO authenticated;
GRANT ALL ON public.users_view TO authenticated;
GRANT ALL ON public.users_view TO service_role; 