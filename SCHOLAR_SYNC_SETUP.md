# Google Scholar Sync Setup Guide

This document explains how to set up and use the automated Google Scholar sync feature.

## Overview

The Google Scholar sync feature automatically pulls research data (publications, citations, h-index) from a faculty member's Google Scholar profile and syncs it with the system.

## Backend Setup

### 1. Install Dependencies

Navigate to the backend directory and install required packages:

```bash
cd backend
npm install
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Update `backend/.env` with Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Start the Backend Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Frontend Setup

### 1. Update Profile with Scholar ID

Faculty members must first set their Google Scholar ID in their profile:
- Navigate to Profile page
- Click "Edit Details"
- Enter Google Scholar ID (found in the URL: `https://scholar.google.com/citations?user=SCHOLAR_ID`)
- Save changes

### 2. Sync Publications

After setting Scholar ID, click "Sync with Google Scholar" button on:
- Dashboard (Profile Card)
- Profile page (Profile Header section)

### How It Works

1. **Frontend Request**: Sends POST request to `/api/scholar/sync` with:
   ```json
   {
     "faculty_id": "user-uuid",
     "scholar_id": "google-scholar-id"
   }
   ```

2. **Python Script Execution**: Backend calls `scholar_fetch.py` which:
   - Queries Google Scholar API using the scholarly library
   - Extracts: publications list, citation count, h-index
   - Returns data in JSON format

3. **Database Update**: Backend updates Supabase:
   - Profiles table: `h_index`, `total_publications`, `total_citations`, `last_scholar_sync`
   - Publications table: Inserts/updates publications from Scholar

4. **Frontend Update**: Dashboard stats automatically refresh with:
   - Total Publications
   - Total Citations
   - H-Index

## Data Fields

### Updated in Profiles Table

- `h_index` (integer): Hirsch index
- `total_publications` (integer): Total publication count
- `total_citations` (integer): Total citation count
- `last_scholar_sync` (timestamp): Last sync timestamp

### Publications Table Structure

Each synced publication includes:
- `title`: Publication title
- `journal_conference`: Venue name
- `year`: Publication year
- `citations`: Citation count
- `doi_link`: DOI if available
- `status`: Always set to 'published'

## Error Handling

If sync fails:
- Check Scholar ID format is correct
- Ensure Scholar profile is public
- Verify Python dependencies are installed
- Check network connectivity

## Console Logs

The system logs:
- `"Google Scholar synced for faculty: <faculty_id>"` on successful sync
- Error messages with details if sync fails

## API Endpoint

### POST /api/scholar/sync

**Request Body:**
```json
{
  "faculty_id": "uuid",
  "scholar_id": "google-scholar-id"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Scholar data synced",
  "data": {
    "h_index": 5,
    "total_publications": 12,
    "total_citations": 45
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Scholar ID required"
}
```

## Finding Your Google Scholar ID

1. Go to https://scholar.google.com
2. Search for your profile
3. Open your profile
4. The URL will be: `https://scholar.google.com/citations?user=YOUR_SCHOLAR_ID`
5. Copy the `YOUR_SCHOLAR_ID` part

Example: If your profile URL is `https://scholar.google.com/citations?user=dQybjqkAAAAJ`, your Scholar ID is `dQybjqkAAAAJ`

## Troubleshooting

### "Scholar ID required"
- Scholar ID is empty. Set it in Profile settings first.

### "Failed to fetch Scholar data"
- Scholar ID might be incorrect
- Scholar profile might be private
- Network issues

### Python script not found
- Ensure `scholar_fetch.py` exists in backend directory
- Check file permissions
- Verify Python 3 is installed

### Dependencies not installed
Run: `pip install -r requirements.txt`
