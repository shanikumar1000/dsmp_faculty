# Testing AI Performance Scoring

Quick guide to test the AI Performance Scoring feature.

## Prerequisites

1. Backend server running (`cd backend && npm start`)
2. Frontend dev server running (starts automatically)
3. Faculty user account (e.g., faculty@test.com)

## Test Steps

### 1. Verify Backend is Running

```bash
cd backend
npm start
```

You should see:
```
🚀 Server is running on port 5000
📊 API ready at http://localhost:5000
```

### 2. Login as Faculty

1. Open http://localhost:5173
2. Click "Login as Faculty"
3. Enter: faculty@test.com
4. Click "Sign In"

### 3. Test AI Analysis Button

1. On the Faculty Dashboard, you'll see:
   - Stats cards showing Publications, Citations, H-Index
   - "Performance Rating" card showing "Pending"
   - Blue button: "Run Performance Analysis"

2. Click "Run Performance Analysis"

3. You should see:
   - Button text changes to: "Analyzing performance using AI..."
   - Button is disabled during analysis
   - After 2-3 seconds, success message appears

4. Success message will show:
   - "Analysis complete! Score: X, Category: Y"
   - Green checkmark icon

5. Performance Rating card updates to show:
   - Score (e.g., "26.5/100")
   - Category badge with color:
     - Green = Excellent
     - Blue = Good
     - Yellow = Average
     - Red = Needs Improvement

### 4. Test with Different Data

**Test Case 1: New Faculty (Low Score)**

Current state (no activities):
- Expected Score: 0-30
- Expected Category: "Needs Improvement" (Red badge)

**Test Case 2: Add Some Activities**

1. Click "Add New Activity"
2. Add a Publication:
   - Paper Title: "Test Paper"
   - Journal: "Test Journal"
   - Year: 2024
   - Submit

3. Add a Workshop:
   - Type: Workshop
   - Title: "Test Workshop"
   - Level: National
   - Role: Conducted
   - Date: Today
   - Submit

4. Return to Dashboard
5. Click "Run Performance Analysis" again
6. Score should increase slightly (still low without Scholar sync)

**Test Case 3: Sync with Google Scholar**

1. Go to Profile page
2. Click "Edit Details"
3. Enter a valid Google Scholar ID
4. Save
5. Click "Sync with Google Scholar"
6. Return to Dashboard
7. Click "Run Performance Analysis"
8. Score should be much higher now (60-90+)
9. Category should be "Good" or "Excellent"

### 5. Verify Console Logs

**Browser Console**:
- No errors should appear
- Network tab shows POST to `/api/ai/analyze`

**Backend Console**:
```
Performance analyzed for faculty: <user-id> - Score: 26.5, Category: Needs Improvement
```

### 6. Test Error Handling

**Scenario: Backend Not Running**

1. Stop the backend server
2. Click "Run Performance Analysis"
3. Should see error message: "Analysis failed. Try again."
4. Red alert icon appears

**Scenario: Invalid Faculty ID**

This shouldn't happen in normal use since faculty_id comes from authenticated user.

### 7. Test Multiple Analyses

1. Click "Run Performance Analysis"
2. Wait for completion
3. Click again
4. Score should remain the same (data hasn't changed)
5. `last_analyzed_at` timestamp updates in database

### 8. Verify Database Updates

Check Supabase Dashboard:

1. Go to Table Editor > profiles
2. Find your faculty record
3. Verify columns updated:
   - `performance_score`: Should have numeric value
   - `performance_category`: Should show category text
   - `last_analyzed_at`: Should show timestamp

## Expected Results Summary

| Publications | Citations | Workshops | Projects | Expected Score | Expected Category |
|--------------|-----------|-----------|----------|----------------|-------------------|
| 0            | 0         | 0         | 0        | 0              | Needs Improvement |
| 10           | 30        | 3         | 1        | 20-30          | Needs Improvement |
| 20           | 60        | 8         | 3        | 40-50          | Average           |
| 30           | 100       | 12        | 5        | 55-65          | Good              |
| 40           | 150       | 15        | 7        | 70-80          | Good/Excellent    |
| 50           | 200       | 20        | 10       | 100            | Excellent         |

## Troubleshooting

### Button Doesn't Appear
- Verify you're logged in as faculty
- Check browser console for errors
- Refresh the page

### Button Stuck on "Analyzing..."
- Check backend is running
- Check backend console for errors
- Refresh the page and try again

### Score Doesn't Update
- Check success message appeared
- Refresh the page
- Check browser console for errors
- Verify Supabase connection

### "Analysis failed. Try again."
1. Check backend is running: `curl http://localhost:5000/`
2. Check Python installed: `python3 --version`
3. Test Python script directly:
   ```bash
   cd backend
   python3 ai_score.py '{"publications":10,"citations":20,"workshops":5,"projects":2}'
   ```
4. Check backend console for detailed error

### Score Seems Low
- Remember: Score is normalized against maximum values
- Maximum publications considered: 50
- Maximum citations considered: 200
- Try syncing with Google Scholar for real data

## API Testing (Optional)

Test the endpoint directly with curl:

```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"faculty_id":"YOUR_FACULTY_ID"}'
```

Replace YOUR_FACULTY_ID with actual user ID from Supabase auth.users table.

Expected response:
```json
{
  "success": true,
  "score": 26.5,
  "category": "Needs Improvement"
}
```

## Python Script Testing

Test the AI scoring logic directly:

```bash
cd backend

# Test Case 1: No data
python3 ai_score.py '{"publications":0,"citations":0,"workshops":0,"projects":0}'
# Expected: {"success": true, "score": 0.0, "category": "Needs Improvement"}

# Test Case 2: Moderate data
python3 ai_score.py '{"publications":20,"citations":60,"workshops":8,"projects":3}'
# Expected: Score around 40-50, category "Average"

# Test Case 3: Excellent data
python3 ai_score.py '{"publications":50,"citations":200,"workshops":20,"projects":10}'
# Expected: {"success": true, "score": 100.0, "category": "Excellent"}

# Test Case 4: Invalid input
python3 ai_score.py '{}'
# Should still work, treats missing values as 0
```

## Success Criteria

- Button appears on dashboard
- Button shows loading state when clicked
- Success message appears after analysis
- Performance score displays correctly
- Category badge shows with correct color
- Score persists after page refresh
- Multiple analyses work correctly
- Error handling works when backend is down
- Console logs appear correctly
- Database fields update correctly

All criteria should pass for the feature to be considered working correctly.
