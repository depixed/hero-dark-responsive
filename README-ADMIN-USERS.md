# Admin User Management

This document explains how to configure Supabase to allow admin access to user data in the admin panel.

## Understanding the Challenge

The Supabase auth schema (`auth.users`) is not directly accessible through the client API due to security restrictions. This is by design, as it contains sensitive user information. However, as an administrator, you need access to user data for management purposes.

## Solution: Using a Secure View

We've provided a SQL migration script (`supabase/migrations/create_users_view.sql`) that creates a secure view to expose user information in a controlled manner.

### How it works:

1. The script creates a `users_view` that joins data from `auth.users` and `profiles`
2. It sets up Row Level Security (RLS) to ensure only administrators can access this view
3. It provides a function `is_admin()` to check if the current user has admin privileges

## Setup Instructions

1. Run the migration script in your Supabase SQL editor:
   - Navigate to your Supabase dashboard
   - Go to the SQL Editor
   - Copy and paste the contents of `supabase/migrations/create_users_view.sql`
   - Replace the admin email addresses with your actual admin emails
   - Run the SQL

2. Configure admin users:
   - In the SQL script, update the list of admin emails:
   ```sql
   WHERE auth.users.email IN ('admin@example.com', 'your-admin-email@domain.com')
   ```

3. Create a database webhook or function to automatically assign admin status to new users if needed

## Troubleshooting

If you're unable to see user data in the admin panel:

1. **Check permissions**: Make sure your current user's email is in the admin list
2. **Verify the view**: Run `SELECT * FROM users_view;` in SQL Editor to test the view
3. **Check RLS policies**: If you get a permission error when running the above query, you need to temporarily disable RLS for testing:
   ```sql
   -- For testing only, don't use in production
   ALTER TABLE public.users_view DISABLE ROW LEVEL SECURITY;
   -- Test your query
   SELECT * FROM users_view;
   -- Re-enable RLS when done
   ALTER TABLE public.users_view ENABLE ROW LEVEL SECURITY;
   ```
4. **Fallback mode**: The system will show limited data (from profiles) even if full user data is unavailable

## Alternative Approaches

If you cannot set up the view:

1. **Use the Supabase Dashboard**: The Supabase Dashboard provides a built-in Authentication > Users section
2. **Use Server Functions**: Create server-side functions that have access to auth data
3. **Use Supabase Edge Functions**: Deploy an edge function with admin privileges 