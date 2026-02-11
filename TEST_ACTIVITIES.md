# Testing Activities Feature

This guide walks you through testing the Add New Activity feature end-to-end.

## Prerequisites

1. Faculty user account created and logged in (e.g., faculty@test.com)
2. Supabase database initialized
3. Dev server running
4. Browser console open (F12 or Ctrl+Shift+I)

## Test Case 1: Submit a Publication

### Steps:
1. Log in as faculty@test.com
2. Navigate to Dashboard
3. Click "Add New Activity" button in Recent Activities section
4. In the form:
   - Activity Type: Select "Publication"
   - Paper Title: "Machine Learning in Healthcare"
   - Journal Name: "IEEE Journal of Biomedical Engineering"
   - Year: 2024
   - DOI Link: https://doi.org/10.1109/example
   - Description: "This paper explores ML applications in healthcare diagnostics"
5. Click "Submit Activity"

### Expected Results:
- Browser shows success message: "Activity submitted successfully!"
- Browser console shows: `New activity saved for faculty: <user-id>`
- Page redirects to Dashboard after 1.5 seconds
- In Recent Activities table, new activity appears with:
  - Today's date
  - "Publication" badge
  - Title: "Machine Learning in Healthcare"
  - Status: "Pending" (yellow badge)

## Test Case 2: Submit a Workshop

### Steps:
1. From Dashboard, click "Add New Activity"
2. In the form:
   - Activity Type: Select "Workshop"
   - Title: "Python for Data Science"
   - Level: "National"
   - Role: "Conducted"
   - Date: Pick a date (e.g., today)
   - Description: "Hands-on workshop covering data analysis with Python"
3. Click "Submit Activity"

### Expected Results:
- Success message shown
- Console logs activity creation
- New workshop appears in Recent Activities
- Status shows "Pending"

## Test Case 3: Submit a Project

### Steps:
1. From Dashboard, click "Add New Activity"
2. In the form:
   - Activity Type: Select "Project"
   - Project Title: "Smart Campus Initiative"
   - Type: "Funded"
   - Duration From: 2024-01-01
   - Duration To: 2024-12-31
   - Grant Amount: 500000
   - Description: "Development of IoT-based campus management system"
3. Click "Submit Activity"

### Expected Results:
- Success message shown
- Console logs activity creation
- New project appears in Recent Activities
- Status shows "Pending"

## Test Case 4: Submit Multiple Activities

### Steps:
1. Submit 3-4 different activities (different types)
2. Go back to Dashboard
3. Check Recent Activities table

### Expected Results:
- All activities appear in the table
- Activities are sorted newest first
- Each has correct type badge
- Each shows "Pending" status
- Console shows multiple "Activities fetched" logs

## Test Case 5: Verify Recent Activities Loading

### Steps:
1. Refresh the page
2. Open browser console
3. Wait for Recent Activities to load
4. Check console output

### Expected Results:
- Loading state shows "Loading activities..."
- After loading: List of activities appears
- Console shows: `Activities fetched for user: <user-id>`
- Activities are still sorted newest first

## Test Case 6: Empty Activities List

### Steps:
1. Create a new test user
2. Log in with the new user
3. Go to Dashboard

### Expected Results:
- Recent Activities shows: "No activities yet. Start by adding a new activity."
- Console shows: `Activities fetched for user: <new-user-id>` with empty array

## Test Case 7: Form Validation

### Steps:
1. From Dashboard, click "Add New Activity"
2. Leave Activity Type as "-- Select an activity type --"
3. Click "Submit Activity" without filling anything

### Expected Results:
- Error message: "Please select an activity type"
- Form is not submitted
- No database entry created

## Test Case 8: Required Fields Validation

### Steps:
1. Select "Publication" as Activity Type
2. Try to submit without filling required fields:
   - Leave Paper Title empty
   - Leave Journal Name empty
3. Browser should prevent submission

### Expected Results:
- Browser shows "Please fill in this field" for empty inputs
- Submit button doesn't work until all required fields filled

## Test Case 9: Navigation Back to Dashboard

### Steps:
1. From Dashboard, click "Add New Activity"
2. Fill in activity details
3. Submit
4. Wait for redirect

### Expected Results:
- After 1.5 seconds, automatically redirected to Dashboard
- Recent Activities table shows the new activity
- Console shows both:
  - `New activity saved for faculty: <user-id>`
  - `Activities fetched for user: <user-id>`

## Test Case 10: Console Logging Verification

### Steps:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Log in as faculty
4. Go to Dashboard
5. Add a new activity
6. Observe console output

### Expected Results:
```
Activities fetched for user: 550e8400-e29b-41d4-a716-446655440000
New activity saved for faculty: 550e8400-e29b-41d4-a716-446655440000
Activities fetched for user: 550e8400-e29b-41d4-a716-446655440000
```

(Note: Activities fetched appears twice - once on initial dashboard load, once after submission)

## Test Case 11: Different Activity Types Form Rendering

### Steps:
1. From Dashboard, click "Add New Activity"
2. Select different activity types and observe form changes:
   - Publication: Shows Paper Title, Journal, Year, DOI
   - Seminar: Shows Title, Level, Role, Date
   - Workshop: Shows Title, Level, Role, Date
   - Guest Lecture: Shows Title, Level, Role, Date
   - FDP / Training: Shows Title, Level, Role, Date
   - Project: Shows Project Title, Type, Duration, Grant Amount

### Expected Results:
- Form fields change based on selected activity type
- Only relevant fields are shown
- All required fields are properly marked

## Browser Console Output Examples

### Successful Activity Submission:
```
New activity saved for faculty: 550e8400-e29b-41d4-a716-446655440000
```

### Dashboard Load:
```
Activities fetched for user: 550e8400-e29b-41d4-a716-446655440000
```

### Error Scenario (if any):
```
Failed to fetch activities: Error: [specific error message]
```

## Debugging Tips

### If Activities Not Showing:
1. Check Supabase connection in `.env`
2. Verify user is authenticated
3. Open DevTools > Network tab
4. Check for Supabase API calls
5. Check for errors in Console tab

### If Submit Fails:
1. Check all required fields are filled
2. Verify user authentication status
3. Check browser console for error message
4. Verify Supabase connection is active
5. Check Supabase database status

### If Console Logs Missing:
1. Verify DevTools console is open
2. Check console filter level (Info, Warning, Error)
3. Try clearing console (Ctrl+L)
4. Refresh page and try again

## Test Data Examples

### Publication:
- Title: "AI in Healthcare"
- Journal: "Nature Machine Intelligence"
- Year: 2024
- DOI: https://doi.org/10.1038/s42256-024-00001-0
- Description: "Comprehensive review of AI applications"

### Workshop:
- Title: "Advanced Python Programming"
- Level: National
- Role: Conducted
- Date: Today
- Description: "Intensive 3-day workshop"

### Project:
- Title: "IoT Smart City"
- Type: Funded
- From: 2024-01-01
- To: 2024-12-31
- Grant: 1000000
- Description: "Development of IoT ecosystem"

### Seminar:
- Title: "Blockchain Security"
- Level: International
- Role: Speaker
- Date: Today
- Description: "Discussion of blockchain security"

## Success Criteria

All test cases should:
1. Not show any JavaScript errors in console
2. Show appropriate user feedback (success/error messages)
3. Update database correctly (verified in Supabase)
4. Show console logs as expected
5. Redirect/navigate as expected
6. Display activities in correct order (newest first)

## Performance Testing

### Check Loading Time:
1. Go to Dashboard
2. Open DevTools > Performance tab
3. Note time to show "Loading activities..."
4. Note time to display activity list
5. Should typically be < 1 second on modern connections

### Check with Many Activities:
1. Submit 10+ activities
2. Verify Dashboard still loads quickly
3. Verify pagination works (if implemented)
4. Verify sort order is correct

## Security Testing

### Verify Data Isolation:
1. Create 2 faculty accounts
2. Faculty1 submits activities
3. Log in as Faculty2
4. Verify Faculty2 cannot see Faculty1's activities
5. Verify Faculty2's activities list is empty or shows only their activities

### Verify Authentication:
1. Open DevTools > Application tab
2. Check localStorage for session tokens
3. Verify tokens are secure
4. Try tampering with tokens (page should handle gracefully)

## Related Test Files

- TEST_LOGIN.md - Login functionality tests
- TEST_ADMIN.md - Admin dashboard tests (if available)
