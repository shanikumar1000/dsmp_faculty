# Authentication Setup Guide

This application uses Supabase Authentication with email/password login.

## How Authentication Works

1. Users sign in with their email and password
2. The system checks their role (faculty or admin) from the profiles table
3. Users are redirected to their respective dashboard based on role
4. Sessions are managed automatically by Supabase

## Creating Test Users

To test the login functionality, you need to create users in Supabase. Here's how:

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Users**
3. Click **Add user** > **Create new user**
4. Enter email and password
5. Click **Create user**

### Option 2: Using SQL

Run this SQL in your Supabase SQL Editor to create test users:

```sql
-- Create a faculty test user
-- First, create the auth user (you'll need to do this via Supabase Dashboard or API)
-- Then create their profile:

-- For Faculty User
INSERT INTO profiles (id, full_name, email, department, designation, employee_id, role)
VALUES (
  'USER_ID_FROM_AUTH',  -- Replace with actual user ID from auth.users
  'Dr. John Doe',
  'faculty@test.com',
  'Computer Science & Engineering',
  'Assistant Professor',
  'F12345',
  'faculty'
);

-- For Admin User
INSERT INTO profiles (id, full_name, email, department, designation, employee_id, role)
VALUES (
  'USER_ID_FROM_AUTH',  -- Replace with actual user ID from auth.users
  'Admin User',
  'admin@test.com',
  'Administration',
  'Administrator',
  'A00001',
  'admin'
);
```

### Option 3: Sign Up Flow (Recommended for Production)

For production, you would implement a sign-up flow where:
1. Admin creates user accounts
2. System sends invitation emails
3. Users set their passwords on first login

## Test Credentials

After creating test users, you can use:

**Faculty Login:**
- Email: faculty@test.com
- Password: (whatever you set)

**Admin Login:**
- Email: admin@test.com
- Password: (whatever you set)

## Important Notes

1. **Role Validation**: The login page checks if the user's role matches the selected login type (faculty/admin)
2. **Session Management**: Supabase automatically manages sessions in localStorage
3. **Logout**: Properly clears the Supabase session and localStorage
4. **Error Handling**: Clear error messages for invalid credentials or role mismatches

## Security Features

- Email/password authentication via Supabase Auth
- Role-based access control (RBAC)
- Automatic session management
- Secure token storage
- Row Level Security (RLS) on all database tables

## Troubleshooting

**Error: "No profile found for user"**
- Make sure you've created a profile record in the `profiles` table for the user
- The profile `id` must match the `id` from `auth.users`

**Error: "This account is not registered as faculty/admin"**
- Check the `role` field in the user's profile
- Make sure it matches the login type you selected

**Can't log in?**
- Verify email and password are correct
- Check that email confirmation is disabled in Supabase Auth settings
- Verify the user exists in Authentication > Users
