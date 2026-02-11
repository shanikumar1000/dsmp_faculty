# Testing PDF Report Generation

Quick guide to test the professional PDF report system.

## Prerequisites

1. Backend server running on port 5000
2. Frontend dev server running (automatic)
3. Admin account created in Supabase
4. At least one faculty member in database

## Step-by-Step Testing

### Step 1: Start Backend

```bash
cd backend
npm start
```

**Expected Output:**
```
Server is running on port 5000
API ready at http://localhost:5000
```

### Step 2: Login as Admin

1. Open application in browser
2. Click "Login as Admin"
3. Enter admin credentials (e.g., admin@test.com)
4. Click "Sign In"
5. Should see Admin Dashboard

### Step 3: Navigate to Faculty Records

1. From Admin Dashboard, scroll down to "Faculty Records" section
2. You should see a table with faculty members
3. Each row shows:
   - Faculty Name
   - Department
   - Employee ID
   - Publications count
   - Performance Rating
   - Actions (Eye icon, Download icon)

### Step 4: Generate PDF Report

1. Find a faculty member in the table
2. Click the **Download** button (download icon)
3. Observe the behavior:
   - Button shows spinning loader
   - Tooltip changes to "Generating official faculty report..."
   - Button is disabled during generation
4. After 1-2 seconds:
   - Green success message appears: "Report downloaded successfully!"
   - PDF file automatically downloads
   - Filename format: `Faculty_Report_<employee_id>.pdf`
   - Button returns to normal state

### Step 5: Verify PDF Contents

Open the downloaded PDF and check:

**Page 1 - Cover:**
- Title: "FACULTY PERFORMANCE APPRAISAL REPORT"
- Institution Name placeholder
- Report date (today's date)
- Faculty details:
  - Name
  - Department
  - Designation
  - Employee ID
  - Google Scholar ID

**Page 2 - Research Summary:**
- Total Publications number
- Total Citations number
- h-index value
- Performance Score (X/100)
- Performance Category badge
- Table with top 5 publications:
  - Year column
  - Title column
  - Journal column
  - Citations column

**Page 3 - Activities:**
- List of latest 10 activities
- Each activity shows:
  - Number
  - Activity type
  - Title
  - Date
  - Status
  - Description (truncated)

**Page 4 - Admin Insights:**
- Auto-generated bullet points based on data
- Examples:
  - "Publication output has increased in recent years"
  - "Strong citation impact demonstrated"
  - "Active participation in professional development"
- Signature line at bottom
- Date stamp

### Step 6: Test Error Scenarios

**Test 1: Backend Not Running**
1. Stop backend server
2. Try to download PDF
3. Expected: Red error message "Report generation failed. Try again."

**Test 2: Multiple Downloads**
1. Click download for Faculty A
2. Immediately click download for Faculty B
3. Expected: Both reports generate independently
4. Each shows loading state on correct button
5. Both PDFs download successfully

**Test 3: Search and Filter**
1. Use search box to find specific faculty
2. Click download on filtered result
3. Expected: PDF generates correctly for that faculty

### Step 7: Verify Console Logs

**Backend Console:**
```
PDF report generated for faculty: 550e8400-e29b-41d4-a716-446655440000
```

**Browser Console:**
- No errors should appear
- If errors, note the message

## Test Cases

### Test Case 1: Faculty with Full Data
**Scenario:** Faculty has publications, activities, performance score

**Expected:**
- All 4 pages populated with data
- Top 5 publications table filled
- Activities list shows items
- Insights are relevant and specific
- Performance score displays correctly

### Test Case 2: New Faculty (Minimal Data)
**Scenario:** Faculty profile exists but no activities/publications

**Expected:**
- Cover page shows faculty details
- Research summary shows zeros
- "No publications recorded yet" message
- "No activities recorded yet" message
- Insights show recommendations
- PDF still generates successfully

### Test Case 3: Faculty with Excellent Performance
**Scenario:** Faculty has score >= 80

**Expected:**
- Performance category shows "Excellent"
- Insights include "Excellent overall performance score achieved"
- Positive remarks in insights
- High publication count reflected

### Test Case 4: Faculty without Scholar ID
**Scenario:** google_scholar_id is null

**Expected:**
- Cover page shows "Not Linked" for Scholar ID
- Rest of report generates normally
- No errors

### Test Case 5: Long Faculty Name
**Scenario:** Faculty name is very long

**Expected:**
- Name displays fully on cover page
- No text overflow
- PDF formatting remains intact

### Test Case 6: Many Activities
**Scenario:** Faculty has more than 10 activities

**Expected:**
- Only latest 10 activities shown
- Activities sorted newest first
- No overflow issues

## Performance Testing

### Response Time
- Click download button
- Note time until PDF downloads
- Expected: 1-2 seconds

### File Size
- Check downloaded PDF file size
- Expected: 50-150 KB depending on data

### Concurrent Downloads
- Open admin dashboard in 2 browser tabs
- Download PDFs simultaneously
- Expected: Both complete successfully

## Common Issues

### Issue: "Report generation failed"
**Solution:**
- Verify backend is running
- Check browser console for errors
- Ensure faculty_id is valid
- Check Supabase connection

### Issue: PDF is blank or incomplete
**Solution:**
- Verify faculty exists in database
- Check faculty has required fields (name, department, etc.)
- Look for backend console errors
- Ensure PDFKit is installed

### Issue: Download button stuck loading
**Solution:**
- Check network tab for failed request
- Refresh page and try again
- Verify backend endpoint is responding

### Issue: Wrong faculty data in PDF
**Solution:**
- Verify correct faculty_id being sent
- Check database data is correct
- Clear browser cache
- Re-fetch faculty list

## Browser Compatibility

Test in multiple browsers:
- Chrome (Recommended)
- Firefox
- Safari
- Edge

Expected: PDF download works in all modern browsers

## Mobile Testing

Test on mobile devices:
1. Login as admin on mobile
2. Navigate to Faculty Records
3. Scroll to action buttons
4. Click download
5. Expected: PDF downloads to device

## Quick Verification Checklist

- [ ] Backend server starts without errors
- [ ] Admin can login successfully
- [ ] Faculty Records table shows real data
- [ ] Download button appears for each faculty
- [ ] Clicking download shows loading spinner
- [ ] Success message appears after generation
- [ ] PDF file downloads automatically
- [ ] Filename matches format: Faculty_Report_<id>.pdf
- [ ] PDF has all 4 pages
- [ ] Cover page has correct faculty details
- [ ] Research summary shows correct metrics
- [ ] Publications table displays data
- [ ] Activities list shows entries
- [ ] Admin insights are relevant
- [ ] Error handling works when backend is down
- [ ] Multiple downloads work correctly
- [ ] No console errors in browser
- [ ] Backend logs PDF generation

## Testing with Sample Data

If no real faculty data available, create test faculty:

```sql
-- In Supabase SQL Editor
INSERT INTO profiles (
  id,
  full_name,
  email,
  department,
  designation,
  employee_id,
  google_scholar_id,
  total_publications,
  total_citations,
  h_index,
  performance_score,
  performance_category,
  role
) VALUES (
  gen_random_uuid(),
  'Dr. Test Faculty',
  'test.faculty@university.edu',
  'Computer Science & Engineering',
  'Assistant Professor',
  'F99999',
  'test_scholar_id',
  15,
  85,
  5,
  75.5,
  'Good',
  'faculty'
);
```

Then test PDF generation for this faculty.

## Automation Testing

For automated testing, use this curl command:

```bash
curl -X POST http://localhost:5000/api/report/generate \
  -H "Content-Type: application/json" \
  -d '{"faculty_id":"YOUR_FACULTY_UUID"}' \
  --output test_report.pdf

# Check if PDF was created
ls -lh test_report.pdf

# Verify it's a valid PDF
file test_report.pdf
```

Expected output:
```
test_report.pdf: PDF document, version 1.4
```

## Success Criteria

The PDF report system is working correctly if:

1. Download button triggers PDF generation
2. Loading state displays during generation
3. PDF downloads automatically
4. Filename is correctly formatted
5. All 4 pages are present in PDF
6. Data matches database records
7. Insights are relevant and accurate
8. Error messages appear for failures
9. Multiple downloads work independently
10. No console errors or warnings

## Next Steps After Testing

Once testing is complete:

1. Test with all faculty members
2. Verify insights accuracy for different profiles
3. Test during high load (multiple admins)
4. Review PDF formatting for edge cases
5. Gather admin feedback on report format
6. Make customizations if needed
7. Document any institution-specific changes

## Troubleshooting Reference

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Button doesn't respond | JavaScript error | Check console |
| Loading never stops | Backend timeout | Check backend logs |
| PDF is empty | No data in database | Verify faculty data |
| Wrong faculty data | ID mismatch | Check request payload |
| Download fails | CORS issue | Verify backend CORS setup |
| Formatting broken | PDFKit version | Check package version |

## Support

If issues persist after testing:
1. Review PDF_REPORT_SYSTEM.md
2. Check backend console output
3. Verify Supabase connection
4. Test backend endpoint with curl
5. Check browser network tab
