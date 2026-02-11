-- =====================================================
-- Create Test Users for Faculty Performance System
-- =====================================================
--
-- INSTRUCTIONS:
-- 1. Create users first via Supabase Dashboard:
--    - Go to Authentication > Users > Add User
--    - Create faculty@test.com with password of your choice
--    - Create admin@test.com with password of your choice
--
-- 2. Copy the user IDs from the dashboard
--
-- 3. Replace 'FACULTY_USER_ID' and 'ADMIN_USER_ID' below with actual IDs
--
-- 4. Run this script in Supabase SQL Editor
-- =====================================================

-- Insert Faculty Profile
INSERT INTO profiles (
  id,
  full_name,
  email,
  department,
  designation,
  employee_id,
  google_scholar_id,
  years_of_experience,
  specialization,
  contact_number,
  role
) VALUES (
  'FACULTY_USER_ID',  -- Replace with actual user ID from auth.users
  'Dr. John Doe',
  'faculty@test.com',
  'Computer Science & Engineering',
  'Assistant Professor',
  'F12345',
  NULL,
  5,
  'Artificial Intelligence, Machine Learning',
  '+91 98765 43210',
  'faculty'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  department = EXCLUDED.department,
  designation = EXCLUDED.designation,
  employee_id = EXCLUDED.employee_id,
  years_of_experience = EXCLUDED.years_of_experience,
  specialization = EXCLUDED.specialization,
  contact_number = EXCLUDED.contact_number,
  role = EXCLUDED.role;

-- Insert Admin Profile
INSERT INTO profiles (
  id,
  full_name,
  email,
  department,
  designation,
  employee_id,
  role
) VALUES (
  'ADMIN_USER_ID',  -- Replace with actual user ID from auth.users
  'Admin User',
  'admin@test.com',
  'Administration',
  'System Administrator',
  'A00001',
  'admin'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  department = EXCLUDED.department,
  designation = EXCLUDED.designation,
  employee_id = EXCLUDED.employee_id,
  role = EXCLUDED.role;

-- Verify the profiles were created
SELECT id, full_name, email, role, employee_id
FROM profiles
WHERE email IN ('faculty@test.com', 'admin@test.com');
