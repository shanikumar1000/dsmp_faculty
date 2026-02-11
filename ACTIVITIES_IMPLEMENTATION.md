# Activities Implementation Guide

This document explains how the Add New Activity feature is connected to Supabase and integrated with the Faculty Dashboard.

## What Was Implemented

### 1. Activity Submission (Frontend)

**File: `src/pages/AddNewActivityPage.tsx`**

When faculty clicks "Submit Activity":
- Validates that activity type is selected
- Collects all form data based on activity type (Publication, Seminar, Workshop, Project, etc.)
- Sends a request to Supabase to save the activity:

```javascript
const { error } = await supabase.from('activities').insert({
  user_id: user.id,
  activity_type: activityType,
  title: getActivityTitle(),
  description: formData.description,
  activity_data: getActivityData(),
  status: 'pending',
});
```

**Features:**
- Each activity includes type-specific data stored as JSON
- Status is automatically set to 'pending' for review
- Timestamp created_at is automatically set
- Logs: `"New activity saved for faculty: <user_id>"`
- Shows success message: "Activity submitted successfully!"
- Redirects to Faculty Dashboard after 1.5 seconds
- Shows error messages if submission fails

### 2. Activity Data Storage (Supabase)

**Table: `activities`**

Activities are stored in Supabase with the following schema:

```sql
CREATE TABLE activities (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,           -- Faculty member
  activity_type text NOT NULL,     -- Publication, Seminar, Workshop, Project, etc.
  title text NOT NULL,             -- Main activity title
  description text NOT NULL,       -- Activity description
  activity_data jsonb,             -- Type-specific fields as JSON
  status text NOT NULL,            -- pending, approved, rejected
  created_at timestamptz,          -- Automatically set
  updated_at timestamptz           -- Automatically set
);
```

**Activity Types Supported:**
- Publication
- Seminar
- Workshop
- Project
- Guest Lecture
- FDP / Training

**Status Values:**
- `pending` - Submitted, awaiting review
- `approved` - Approved by admin
- `rejected` - Rejected by admin

**Type-Specific Data Storage:**

Each activity type stores different data in the `activity_data` JSON field:

**Publication:**
```json
{
  "paperTitle": "...",
  "journalName": "...",
  "year": "...",
  "doiLink": "...",
  "description": "..."
}
```

**Seminar/Workshop/Guest Lecture/FDP:**
```json
{
  "title": "...",
  "level": "Local|National|International",
  "role": "Attended|Conducted|Speaker",
  "date": "...",
  "description": "..."
}
```

**Project:**
```json
{
  "projectTitle": "...",
  "projectType": "Funded|Industry|Internal",
  "durationFrom": "...",
  "durationTo": "...",
  "grantAmount": "...",
  "description": "..."
}
```

### 3. Recent Activities Display (Dashboard)

**File: `src/components/RecentActivities.tsx`**

The Recent Activities component now:
- Fetches activities from Supabase when component loads
- Retrieves only the current user's activities
- Sorts by created_at (newest first)
- Limits to 10 most recent activities
- Shows loading state while fetching

**Features:**
- Displays:
  - Date (formatted as DD/MM/YYYY)
  - Activity Type (with badge)
  - Title
  - Status (with color coding)
- Status Color Coding:
  - `pending` = Yellow badge
  - `approved` = Green badge
  - `rejected` = Red badge
- Logs: `"Activities fetched for user: <user_id>"`
- Shows "No activities yet" message if empty

### 4. Security

**Row Level Security (RLS):**
- Users can only view their own activities
- Users can only create activities for themselves
- Users can only update/delete their own activities
- Policies are enforced at the database level

**RLS Policies:**
```sql
-- Users can view their own activities
CREATE POLICY "Users can view own activities" ...
USING (auth.uid() = user_id);

-- Users can create activities
CREATE POLICY "Users can create activities" ...
WITH CHECK (auth.uid() = user_id);

-- Users can update their own activities
CREATE POLICY "Users can update own activities" ...
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own activities
CREATE POLICY "Users can delete own activities" ...
USING (auth.uid() = user_id);
```

## How to Test

### Step 1: Create Test Data

1. Log in as a faculty member (faculty@test.com)
2. Navigate to Dashboard > Activities
3. Click "Add New Activity"
4. Select an activity type (e.g., Publication)
5. Fill in the form with sample data
6. Click "Submit Activity"

### Step 2: Verify Submission

1. Check browser console for: `"New activity saved for faculty: <user_id>"`
2. See success message: "Activity submitted successfully!"
3. Should redirect to Dashboard automatically

### Step 3: Verify Recent Activities Display

1. On the Faculty Dashboard, see the "Recent Activities" section
2. The newly submitted activity should appear at the top (latest first)
3. Should show:
   - Today's date
   - Activity type badge
   - Activity title
   - Status: "Pending" (yellow badge)

### Step 4: Test Fetch Logging

1. Check browser console for: `"Activities fetched for user: <user_id>"`
2. This appears when the Recent Activities component loads

## Activity Flow Diagram

```
Faculty User
    |
    v
Add New Activity Page
    |
    +-- Validate form
    |
    +-- Collect activity data
    |
    v
Supabase Activities Table
    |
    +-- Save with status: 'pending'
    +-- Auto-set created_at timestamp
    +-- Log to console
    |
    v
Show success message
    |
    v
Redirect to Dashboard (1.5s delay)
    |
    v
Recent Activities Component
    |
    +-- Fetch user's activities
    +-- Sort by created_at DESC
    +-- Display in table
    +-- Log fetch to console
```

## Console Logs

**When Submitting Activity:**
```
New activity saved for faculty: 550e8400-e29b-41d4-a716-446655440000
```

**When Dashboard Loads:**
```
Activities fetched for user: 550e8400-e29b-41d4-a716-446655440000
```

**If Error Occurs:**
```
Failed to fetch activities: Error: [error message]
```

## Database Schema Details

**Indexes for Performance:**
- `idx_activities_user_id` - For filtering by user
- `idx_activities_status` - For filtering by status
- `idx_activities_created_at` - For sorting by date

**Timestamps:**
- `created_at` - Set when activity is created
- `updated_at` - Set when activity is created or updated

## API Endpoints Used

### Submit Activity
**Direct Supabase Call:**
```javascript
supabase.from('activities').insert({...})
```

### Fetch Activities
**Direct Supabase Call:**
```javascript
supabase
  .from('activities')
  .select('id, created_at, activity_type, title, status')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

Note: These are Supabase client calls, not REST API endpoints. They connect directly to the database.

## Files Modified

1. `src/pages/AddNewActivityPage.tsx`
   - Added console logging for activity submission
   - Activity submission already implemented

2. `src/components/RecentActivities.tsx`
   - Replaced mock data with Supabase queries
   - Added loading state
   - Added date formatting
   - Added activity fetching on component mount
   - Added console logging for activity fetch

## Files Not Modified

- No backend files needed (using Supabase directly)
- No API routes needed (using Supabase client)
- Database migrations already in place

## Important Notes

1. **Authenticated Users Only:**
   - Both activity submission and fetching require authentication
   - Automatic checks with `supabase.auth.getUser()`

2. **RLS Enforced:**
   - Users can never see another user's activities
   - Enforced at database level, not application level

3. **Real-time Capability:**
   - Supabase supports real-time subscriptions
   - Current implementation uses polling (refresh on page load)
   - Can be enhanced with real-time updates in future

4. **Status Management:**
   - Activities start as 'pending'
   - Admins can approve/reject (future feature)
   - Status changes update the dashboard immediately

## Next Steps

1. **Admin Approval System:**
   - Create admin endpoint to approve/reject activities
   - Send notifications to faculty
   - Update dashboard to show status changes

2. **Admin Dashboard:**
   - View all faculty activities
   - Filter by status (pending, approved, rejected)
   - Approve/reject activities with comments

3. **Real-time Updates:**
   - Add Supabase real-time subscriptions
   - Instant updates when status changes
   - Notifications for activity changes

4. **Activity Details:**
   - Create activity detail view
   - Show full activity_data JSON
   - Allow editing (before approval)

5. **File Uploads:**
   - Implement proof file uploads to Supabase Storage
   - Store file references in activity_data
   - Download/view proof files

## Troubleshooting

**Activities Not Appearing:**
- Check authentication (is user logged in?)
- Check browser console for errors
- Verify user has created activities
- Check Supabase RLS policies are correct

**Submission Failed:**
- Check required fields are filled
- Verify user authentication
- Check Supabase database connection
- Review browser console for error message

**Wrong Activities Showing:**
- Verify RLS policies (should only show own activities)
- Check user_id in activities table
- Ensure authenticated user ID is correct

**Date Display Issues:**
- Check timezone settings
- Verify date formatting function
- Check created_at timestamp is valid

## Security Considerations

1. **Data Isolation:**
   - RLS ensures users only see their own data
   - Cannot be bypassed from frontend

2. **Authentication Required:**
   - All operations require valid Supabase session
   - Token automatically managed

3. **Audit Trail:**
   - created_at and updated_at timestamps
   - user_id identifies who submitted
   - Status history for approval process

4. **Input Validation:**
   - Activity type restricted to valid values
   - Status restricted to valid values
   - Form validation on frontend
   - Database constraints enforced

## Performance Optimization

**Current Implementation:**
- Loads 10 most recent activities
- Uses indexed queries for fast retrieval
- Polling on page load

**Potential Improvements:**
1. Implement pagination for many activities
2. Add Supabase real-time subscriptions
3. Cache activities in frontend state
4. Implement infinite scroll
5. Add search/filter capabilities
