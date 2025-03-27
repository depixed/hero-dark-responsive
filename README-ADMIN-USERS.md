# Admin Users Management

This document provides an overview of how user management works in the admin panel.

## Users View

The admin panel now includes a Users page that displays all registered users. This page shows:

- User names
- Email addresses
- Registration dates
- Detailed user information (when clicking the view button)

## Technical Implementation

### Database View

The system uses a custom SQL view `users_view` that joins information from:
- `auth.users` - The default Supabase auth table
- `public.profiles` - Our custom profiles table

This allows us to see all user information in one place, including:
- Authentication data (email, role, creation date)
- Profile data (name, avatar, phone)

### User Types

The system captures both types of users:
1. **Full Registered Users** - Users who complete the full registration process
2. **Early Access Subscribers** - Users who sign up via the early access form

## Adding New Features

To extend the user management functionality:

1. Modify the `getUsers` function in `src/lib/supabase.ts` for new data requirements
2. Update the `users_view` SQL view if additional database fields are needed
3. Extend the `UsersPage.tsx` component to display new information

## Security Considerations

- The `users_view` has appropriate permissions to ensure only authenticated admin users can access the data
- Row-Level Security (RLS) is in place for all tables
- Make sure any new features maintain proper access control 