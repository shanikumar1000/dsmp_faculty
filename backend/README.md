# Faculty Performance Management System - Backend

Node.js + Express backend with Firebase Firestore and Authentication.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file

### 3. Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Firebase credentials from the downloaded JSON file

```bash
cp .env.example .env
```

### 4. Run the Server

```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

**POST** `/api/auth/login`
- Body: `{ email, password, role }`
- Returns: Mock success response

### Faculty

**POST** `/api/faculty`
- Body: `{ faculty_id, name, department, email, scholar_id, designation }`
- Creates faculty profile in Firestore

**GET** `/api/faculty/:id`
- Fetches faculty profile by ID

### Activities

**POST** `/api/activities`
- Body: `{ faculty_id, type, title, date, description, proof_link }`
- Creates activity record

**GET** `/api/activities/:faculty_id`
- Fetches all activities for a faculty member

### Publications

**POST** `/api/publications`
- Body: `{ faculty_id, paper_title, journal_name, year, doi_link, citations }`
- Creates publication record

**GET** `/api/publications/:faculty_id`
- Fetches all publications for a faculty member

## Firestore Collections

### faculty
- faculty_id (string)
- name (string)
- department (string)
- email (string)
- scholar_id (string, nullable)
- designation (string, nullable)
- created_at (timestamp)
- updated_at (timestamp)

### activities
- faculty_id (string)
- type (string)
- title (string)
- date (string)
- description (string, nullable)
- proof_link (string, nullable)
- status (string, default: 'pending')
- created_at (timestamp)
- updated_at (timestamp)

### publications
- faculty_id (string)
- paper_title (string)
- journal_name (string)
- year (string)
- doi_link (string, nullable)
- citations (number, default: 0)
- status (string)
- created_at (timestamp)
- updated_at (timestamp)

## Console Logging

The backend logs all operations:
- ✅ Success messages
- ❌ Error messages
- 📝 Data creation operations
- 🔍 Data fetch operations
- ⚠️  Warning messages
