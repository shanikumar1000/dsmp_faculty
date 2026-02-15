# Faculty Performance Management System - Backend

Node.js + Express backend with Supabase (PostgreSQL, Auth, Storage).

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Project Settings > API
4. Copy the **Project URL** and **service_role** key

### 3. Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials

```bash
cp .env.example .env
```

Add to `.env`:
- **SUPABASE_URL** – Your Supabase project URL
- **SUPABASE_SERVICE_ROLE_KEY** – Your Supabase service role key (keep secret!)

Use the **same** Supabase project as the frontend so admin sees the same data as faculty.

### 4. Run the Server

```bash
npm start
# or for development: npm run dev
```

The server runs on `http://localhost:5000`

Health check: `GET http://localhost:5000/api/admin/health`

## API Endpoints

### Authentication

**POST** `/api/auth/login`
- Body: `{ email, password, role }`
- Returns: Mock success response (real auth uses Supabase on frontend)

### Faculty

**POST** `/api/faculty`
- Body: `{ faculty_id, name, department, email, scholar_id, designation }`
- Creates faculty profile in Supabase (auth user + profile)

**GET** `/api/faculty/:id`
- Fetches faculty profile by employee ID

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

### Admin (dashboard, reports, analytics)

- `GET /api/admin/health` – Health check
- `GET /api/admin/stats` – Dashboard stats
- `GET /api/admin/faculty` – All faculty
- `GET /api/admin/activities` – All activities
- `POST /api/admin/create-faculty` – Create faculty
- And more – see routes

## Data Model (Supabase)

- **profiles** – Faculty/admin profiles (linked to Supabase Auth)
- **activities** – Faculty activities (workshops, seminars, publications, etc.)
- **publications** – Publications with citations

## Console Logging

- ✅ Success messages
- ❌ Error messages
- 📝 Data creation operations
- 🔍 Data fetch operations
- ⚠️ Warning messages
