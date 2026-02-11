# Admin Analytics Guide

Complete guide to the Admin Analytics Dashboard with real-time data from Supabase.

## Overview

The Admin Analytics Dashboard provides comprehensive insights into faculty performance, publications, and activities using real data from the Supabase database.

## Features Implemented

### 1. Real-Time Statistics Cards

Four key metrics displayed at the top:

- **Total Faculty**: Count of all faculty members in the system
- **Total Publications**: Sum of all publications across all faculty
- **Pending Submissions**: Count of activities awaiting review (status = 'pending')
- **Average Performance**: Average performance score across all faculty

### 2. Data Visualization Charts

**Publications Over Years**
- Line chart showing publication trends by year
- X-axis: Year
- Y-axis: Number of publications
- Data source: publications table

**Department Performance Comparison**
- Bar chart comparing average performance scores by department
- X-axis: Department name
- Y-axis: Average performance score
- Data source: profiles table (aggregated by department)

### 3. Faculty Ranking Panel

"Top Performing Faculty" table displaying:
- Rank (with medals for top 3)
- Faculty Name
- Department
- Total Publications
- Total Citations
- Performance Score

Sorted by performance_score (highest first), limited to top 10.

### 4. Recent Activity Feed

Shows the 5 most recent activities with:
- Faculty member name
- Activity type (publication, workshop, seminar, etc.)
- Activity title
- Time ago (e.g., "2 hours ago", "1 day ago")

## Backend API Endpoints

All endpoints are prefixed with `/api/admin/`

### GET /api/admin/stats

Returns aggregate statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFaculty": 5,
    "totalPublications": 45,
    "pendingActivities": 3,
    "avgPerformance": "72.5"
  }
}
```

### GET /api/admin/publication-trends

Returns publication counts by year.

**Response:**
```json
{
  "success": true,
  "data": [
    { "year": 2020, "count": 5 },
    { "year": 2021, "count": 8 },
    { "year": 2022, "count": 12 },
    { "year": 2023, "count": 15 },
    { "year": 2024, "count": 20 }
  ]
}
```

### GET /api/admin/department-performance

Returns average performance score per department.

**Response:**
```json
{
  "success": true,
  "data": [
    { "department": "Computer Science & Engineering", "avgScore": "75.2" },
    { "department": "Electronics & Communication", "avgScore": "68.5" },
    { "department": "Mechanical Engineering", "avgScore": "71.8" }
  ]
}
```

### GET /api/admin/top-faculty

Returns top 10 faculty ranked by performance score.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "full_name": "Dr. John Doe",
      "department": "Computer Science & Engineering",
      "total_publications": 25,
      "total_citations": 150,
      "performance_score": 85.5
    },
    ...
  ]
}
```

### GET /api/admin/recent-activities

Returns 5 most recent activities with faculty names.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "facultyName": "Dr. John Doe",
      "activityType": "Publication",
      "title": "AI in Healthcare",
      "createdAt": "2024-02-11T10:30:00Z"
    },
    ...
  ]
}
```

## How to Test

### Prerequisites

1. Backend server running: `cd backend && npm start`
2. Frontend dev server running (starts automatically)
3. Admin user account created in Supabase

### Test Steps

**Step 1: Login as Admin**
1. Go to application
2. Click "Login as Admin"
3. Enter admin credentials (e.g., admin@test.com)
4. Sign in

**Step 2: Navigate to Analytics**
1. From the admin sidebar, click "Analytics"
2. You should see the Admin Analytics Dashboard

**Step 3: Verify Statistics Cards**
1. Check "Total Faculty" - should show count of faculty users
2. Check "Total Publications" - should show sum of all publications
3. Check "Pending Submissions" - should show count of pending activities
4. Check "Average Performance" - should show average score

**Step 4: Verify Charts**
1. **Publications Over Years**: Should display line chart with real publication data
2. **Department Performance**: Should display bar chart with department averages

**Step 5: Verify Faculty Ranking**
1. Should show top 10 faculty
2. Sorted by performance score (highest first)
3. Top 3 should have medal icons
4. Columns: Rank, Name, Department, Publications, Citations, Score

**Step 6: Verify Recent Activity Feed**
1. Should show 5 most recent activities
2. Each shows faculty name, activity type, title, and time
3. Time should be formatted (e.g., "2 hours ago")

### Test with Sample Data

To test with sample data:

**Create Test Faculty:**
```sql
-- See create_test_users.sql for creating test users
```

**Add Sample Publications:**
```sql
INSERT INTO publications (user_id, title, journal_conference, year, citations, status)
VALUES
  ('faculty-id-1', 'AI in Healthcare', 'IEEE Journal', 2024, 15, 'published'),
  ('faculty-id-1', 'Machine Learning Basics', 'ACM Conference', 2023, 8, 'published'),
  ('faculty-id-2', 'Data Science Review', 'Nature', 2024, 25, 'published');
```

**Add Sample Activities:**
```sql
INSERT INTO activities (user_id, activity_type, title, description, status)
VALUES
  ('faculty-id-1', 'Workshop', 'Python for Data Science', 'Workshop on Python', 'pending'),
  ('faculty-id-2', 'Seminar', 'AI Ethics', 'Seminar on AI ethics', 'pending');
```

**Run Performance Analysis:**
- Login as each faculty
- Click "Run Performance Analysis"
- This will populate performance scores

## Database Tables Used

### profiles
- Fields: id, full_name, department, total_publications, total_citations, performance_score, role
- Used for: faculty counts, publication sums, performance averages, top faculty

### publications
- Fields: user_id, title, year, citations
- Used for: publication trends chart

### activities
- Fields: user_id, activity_type, title, status, created_at
- Used for: pending submissions count, recent activity feed

## Navigation Flow

```
Admin Login
  ↓
Admin Dashboard (default)
  ↓
Click "Analytics" in sidebar
  ↓
Admin Analytics Page (real-time data)
  ↓
Click "Dashboard" to return
```

## Technical Implementation

### Frontend
- **Component**: `src/pages/AdminAnalyticsPage.tsx`
- **Routing**: Handled in `src/App.tsx`
- **Data Fetching**: Direct HTTP calls to backend API
- **State Management**: React useState hooks
- **Charts**: Custom SVG-based line and bar charts

### Backend
- **Routes**: `backend/routes/admin.js`
- **Controllers**: `backend/controllers/adminController.js`
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (admin role check)

## Performance Considerations

- All queries use Supabase indexes for fast retrieval
- Aggregations done at database level
- Frontend caching via React state
- Lazy loading with loading states

## Security

- Only users with role='admin' can access admin endpoints
- Row Level Security (RLS) enforced at database
- Admin routes require authentication
- No sensitive data exposed in API responses

## Error Handling

- Loading states while fetching data
- Empty state messages when no data available
- Console error logging for debugging
- Graceful fallbacks for missing data

## Future Enhancements

1. **Auto-Refresh**: Add real-time updates every 30 seconds
2. **Date Filters**: Allow filtering by date range
3. **Export**: Add CSV/PDF export functionality
4. **Drill-Down**: Click chart elements to view details
5. **Notifications**: Alert admins of pending submissions
6. **Custom Reports**: Generate custom performance reports
7. **Comparison**: Compare faculty side-by-side
8. **Predictive Analytics**: AI-powered performance predictions

## Troubleshooting

### "No data available" messages
- Verify backend is running on port 5000
- Check database has sample data
- Verify faculty have performance scores

### Charts not displaying
- Check browser console for errors
- Verify publication and profile data exists
- Ensure data is in correct format

### API errors
- Check backend console for detailed errors
- Verify Supabase connection in .env file
- Ensure service role key has proper permissions

### Performance scores missing
- Faculty must run "Performance Analysis" first
- Check AI scoring backend is working
- Verify performance_score column has data

## Console Logs

When analytics page loads, you should see:
- No errors in browser console
- Backend logs API requests:
  - `GET /api/admin/stats`
  - `GET /api/admin/publication-trends`
  - `GET /api/admin/department-performance`
  - `GET /api/admin/top-faculty`
  - `GET /api/admin/recent-activities`

## Files Created/Modified

**Created:**
- `backend/routes/admin.js`
- `backend/controllers/adminController.js`
- `src/pages/AdminAnalyticsPage.tsx`
- `ADMIN_ANALYTICS_GUIDE.md` (this file)

**Modified:**
- `backend/server.js` - Added admin routes
- `src/App.tsx` - Added admin analytics routing
- `src/pages/AdminDashboardPage.tsx` - Added navigation props

## Support

For issues or questions:
1. Check browser console for frontend errors
2. Check backend console for API errors
3. Verify Supabase connection and data
4. Review this guide for troubleshooting steps
