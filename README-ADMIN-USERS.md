# Admin Users Management

This feature allows administrators to view and manage users of the application.

## Implementation Details

### Database

The implementation uses a Supabase view `users_view` that safely exposes selected fields from the `auth.users` table. This approach provides a security layer between the application and the actual authentication tables.

```sql
CREATE OR REPLACE VIEW public.users_view AS
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data,
  email_confirmed_at
FROM auth.users;
```

### Security

- Row Level Security (RLS) is enabled on the view
- Only authenticated users can access the view
- Future enhancement: Restrict to users with admin role only

### User Interface

The admin users page displays:
- Email address
- Full name (from user metadata)
- Verification status (verified or pending)
- Account creation date
- Last sign in date

## How to Use

1. Login to the admin dashboard at `/admin/login`
2. Navigate to "Users" in the sidebar
3. View the list of all users with their status

## Future Enhancements

- User role management
- User account suspension/deletion
- Filter and search functionality
- Pagination for large user lists
- Export user data to CSV 