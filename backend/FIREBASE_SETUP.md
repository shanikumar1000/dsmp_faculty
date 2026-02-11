# Firebase Setup Guide

Complete guide to set up Firebase for the Faculty Performance Management System.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `faculty-performance-system` (or your preferred name)
4. Enable/Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In the Firebase Console, click "Firestore Database" in the left menu
2. Click "Create database"
3. Select "Start in test mode" (for development)
4. Choose a location close to your users
5. Click "Enable"

**Production Note:** Later, update Firestore security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /faculty/{facultyId} {
      allow read, write: if request.auth != null;
    }
    match /activities/{activityId} {
      allow read, write: if request.auth != null;
    }
    match /publications/{publicationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 3: Enable Firebase Authentication

1. Click "Authentication" in the left menu
2. Click "Get started"
3. Click "Email/Password" under Sign-in method
4. Toggle "Enable" to ON
5. Click "Save"

## Step 4: Generate Service Account Key

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Click the "Service accounts" tab
4. Click "Generate new private key"
5. Click "Generate key" in the confirmation dialog
6. A JSON file will download - **KEEP THIS SECURE!**

## Step 5: Configure Backend Environment

1. Navigate to `backend/` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Open the downloaded JSON file from Step 4
4. Copy values from JSON to your `.env` file:

**JSON File Example:**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**Your `.env` File:**
```env
PORT=5000

FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

**Important Notes:**
- Keep the `\n` in the private key string
- Wrap the private key in quotes
- Never commit the `.env` file or JSON file to git

## Step 6: Install Dependencies

```bash
cd backend
npm install
```

## Step 7: Start the Server

```bash
npm start
```

You should see:
```
🚀 Server is running on port 5000
📊 API ready at http://localhost:5000
✅ Firebase Admin initialized successfully
```

## Step 8: Test the Connection

Create a test faculty profile:
```bash
curl -X POST http://localhost:5000/api/faculty \
  -H "Content-Type: application/json" \
  -d '{
    "faculty_id": "TEST001",
    "name": "Test Faculty",
    "department": "Computer Science",
    "email": "test@university.edu"
  }'
```

## Step 9: Verify in Firebase Console

1. Go back to Firebase Console
2. Click "Firestore Database"
3. You should see a new collection `faculty` with your test document

## Firestore Collections Structure

The backend automatically creates these collections:

### faculty
- Stores faculty profiles
- Document ID: faculty_id

### activities
- Stores all faculty activities
- Auto-generated document IDs
- Indexed by faculty_id

### publications
- Stores research publications
- Auto-generated document IDs
- Indexed by faculty_id

## Security Best Practices

1. **Never commit credentials:**
   - `.env` file is in `.gitignore`
   - Service account JSON is in `.gitignore`

2. **Use environment variables:**
   - All Firebase credentials are in `.env`
   - Never hardcode credentials in code

3. **Update Firestore rules:**
   - Default test mode allows all access
   - Update rules before production deployment

4. **Restrict service account access:**
   - Only give necessary permissions
   - Rotate keys periodically

## Troubleshooting

### Error: Firebase Admin initialization error
- Check that all environment variables are set correctly
- Verify the private key includes `\n` characters
- Ensure quotes around the private key

### Error: Permission denied
- Check Firestore security rules
- Verify service account has proper permissions

### Error: Collection not found
- Collections are created automatically on first write
- No need to manually create them

## Next Steps

1. Test all API endpoints using Postman or curl
2. Import `FPMS_API.postman_collection.json` for easy testing
3. Review `API_TESTING.md` for example requests
4. Update Firestore security rules for production
