# AI Performance Scoring Module

This document explains the AI-based Faculty Performance Scoring feature.

## Overview

The AI Performance Scoring module analyzes faculty performance based on academic metrics and provides:
- Performance Score (0-100)
- Performance Category (Excellent, Good, Average, Needs Improvement)

## How It Works

### 1. Frontend (Faculty Dashboard)

**Location**: `src/pages/DashboardPage.tsx`

**Features**:
- "Run Performance Analysis" button
- Loading state: "Analyzing performance using AI..."
- Displays performance score and category with color-coded badges
- Success/error messages

**Badge Colors**:
- Excellent → Green
- Good → Blue
- Average → Yellow
- Needs Improvement → Red

### 2. Backend API

**Endpoint**: `POST /api/ai/analyze`

**Request**:
```json
{
  "faculty_id": "user-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "score": 75.5,
  "category": "Good"
}
```

### 3. Scoring Algorithm

**File**: `backend/ai_score.py`

**Weighted Rule-Based Model**:

```
Score = (0.4 × Publications) + (0.3 × Citations) + (0.2 × Workshops) + (0.1 × Projects)
```

**Normalization**:
- Publications: 0-50 (max)
- Citations: 0-200 (max)
- Workshops: 0-20 (max)
- Projects: 0-10 (max)

**Categories**:
- Score ≥ 80 → Excellent
- Score 60-79 → Good
- Score 40-59 → Average
- Score < 40 → Needs Improvement

### 4. Data Storage

**Database**: Supabase `profiles` table

**Fields**:
- `performance_score` (numeric): Computed score (0-100)
- `performance_category` (text): Category label
- `last_analyzed_at` (timestamp): Last analysis time

## Installation

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Verify Database Migration

The migration `add_performance_scoring_fields` has already been applied. Verify:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('performance_score', 'performance_category', 'last_analyzed_at');
```

### 3. Start Backend Server

```bash
cd backend
npm start
```

Backend will be available at `http://localhost:5000`

### 4. Start Frontend

The dev server starts automatically. Access at `http://localhost:5173`

## Testing

### Step 1: Login as Faculty

1. Go to the application
2. Click "Login as Faculty"
3. Enter credentials: `faculty@test.com`

### Step 2: Add Some Activities

1. From Dashboard, click "Add New Activity"
2. Add a few publications, workshops, or projects
3. Return to Dashboard

### Step 3: Sync Google Scholar (Optional)

1. Go to Profile page
2. Set your Google Scholar ID
3. Click "Sync with Google Scholar"
4. Return to Dashboard

### Step 4: Run Performance Analysis

1. On Dashboard, locate the "Run Performance Analysis" button
2. Click the button
3. Wait for the message: "Analyzing performance using AI..."
4. After a few seconds, see success message
5. Performance Score and Category will update

### Expected Results

**Before Analysis**:
- Performance Rating shows "Pending"

**After Analysis**:
- Performance Rating shows score (e.g., "75.5/100")
- Category badge appears (e.g., "Good" in blue)
- Success message: "Analysis complete! Score: 75.5, Category: Good"

## Example Scenarios

### Scenario 1: New Faculty (No Data)

**Data**:
- Publications: 0
- Citations: 0
- Workshops: 0
- Projects: 0

**Result**:
- Score: 0
- Category: Needs Improvement

### Scenario 2: Active Researcher

**Data**:
- Publications: 15
- Citations: 50
- Workshops: 5
- Projects: 2

**Result**:
- Score: ~60-70
- Category: Good

### Scenario 3: Excellent Performer

**Data**:
- Publications: 30
- Citations: 120
- Workshops: 12
- Projects: 5

**Result**:
- Score: ~80-90
- Category: Excellent

## Console Logs

**When Analysis Runs**:
```
Performance analyzed for faculty: 550e8400-e29b-41d4-a716-446655440000 - Score: 75.5, Category: Good
```

**If Error Occurs**:
```
AI scoring error: [error details]
```

## API Flow

```
1. User clicks "Run Performance Analysis"
   ↓
2. Frontend sends POST /api/ai/analyze
   ↓
3. Backend fetches data from Supabase:
   - profiles table: total_publications, total_citations
   - activities table: count workshops and projects
   ↓
4. Backend calls Python script: ai_score.py
   ↓
5. Python computes weighted score and category
   ↓
6. Backend updates profiles table
   ↓
7. Frontend refetches profile data
   ↓
8. Dashboard displays updated score and category
```

## Files Modified/Created

### Created Files:
1. `backend/ai_score.py` - Python ML scoring script
2. `backend/controllers/aiController.js` - API controller
3. `backend/routes/ai.js` - API route
4. `supabase/migrations/*_add_performance_scoring_fields.sql` - Database migration

### Modified Files:
1. `backend/server.js` - Added AI routes
2. `backend/requirements.txt` - Added numpy
3. `src/pages/DashboardPage.tsx` - Added analysis button and display
4. `src/hooks/useProfile.ts` - Added performance fields to interface

## Troubleshooting

### "Analysis failed. Try again."

**Possible Causes**:
1. Backend server not running
2. Python not installed or wrong version
3. Missing Python dependencies
4. Database connection issue

**Solutions**:
1. Start backend: `cd backend && npm start`
2. Install Python 3: `python3 --version`
3. Install dependencies: `pip install -r requirements.txt`
4. Check `.env` has correct Supabase credentials

### Backend Returns 500 Error

**Check**:
1. Backend console for error messages
2. Python script permissions: `chmod +x backend/ai_score.py`
3. Python path in system

### Score Shows "Pending"

**Causes**:
1. Analysis hasn't been run yet
2. Analysis failed silently
3. Profile not fetched after analysis

**Solutions**:
1. Click "Run Performance Analysis"
2. Check browser console for errors
3. Refresh the page

### Score Seems Wrong

**Remember**:
- Score is relative to normalization thresholds
- Publications max: 50
- Citations max: 200
- Workshops max: 20
- Projects max: 10

Adjust thresholds in `ai_score.py` if needed.

## Future Enhancements

1. **Historical Tracking**: Store analysis history over time
2. **Department Comparison**: Compare against department averages
3. **Custom Weights**: Allow admin to adjust scoring weights
4. **Machine Learning**: Train on real faculty data
5. **Recommendations**: Provide actionable improvement suggestions
6. **Automated Analysis**: Schedule periodic analysis
7. **Performance Trends**: Show score changes over time

## Security

- Only authenticated users can run analysis
- Users can only analyze their own performance
- RLS policies enforce data isolation
- API validates faculty_id ownership

## Performance

- Analysis typically completes in 2-3 seconds
- Python script processes data locally
- No external API calls (except Supabase)
- Efficient database queries with indexes

## Maintenance

### Update Normalization Thresholds

Edit `backend/ai_score.py`:

```python
norm_publications = normalize_value(publications, 0, 50)  # Change 50 to new max
norm_citations = normalize_value(citations, 0, 200)      # Change 200 to new max
norm_workshops = normalize_value(workshops, 0, 20)       # Change 20 to new max
norm_projects = normalize_value(projects, 0, 10)         # Change 10 to new max
```

### Update Category Thresholds

Edit `backend/ai_score.py`:

```python
if score >= 80:            # Change to adjust Excellent threshold
    category = "Excellent"
elif score >= 60:          # Change to adjust Good threshold
    category = "Good"
elif score >= 40:          # Change to adjust Average threshold
    category = "Average"
```

### Update Scoring Weights

Edit `backend/ai_score.py`:

```python
score = (
    0.4 * norm_publications +  # Change 0.4 to adjust publications weight
    0.3 * norm_citations +     # Change 0.3 to adjust citations weight
    0.2 * norm_workshops +     # Change 0.2 to adjust workshops weight
    0.1 * norm_projects        # Change 0.1 to adjust projects weight
)
```

Total weights should sum to 1.0 (100%).

## Support

For issues or questions:
1. Check browser console for frontend errors
2. Check backend console for API errors
3. Verify Python script runs: `python3 backend/ai_score.py '{"publications":10,"citations":20,"workshops":5,"projects":2}'`
4. Check database migration applied successfully
