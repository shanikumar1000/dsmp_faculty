# API Testing Guide

Test the backend API using these example requests.

## Prerequisites
- Server running at `http://localhost:5000`
- Use Postman, curl, or any API testing tool

---

## 1. Test Authentication

### Login (Mock)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "faculty@university.edu",
    "password": "password123",
    "role": "faculty"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "email": "faculty@university.edu",
    "role": "faculty",
    "token": "mock_token_1234567890"
  }
}
```

---

## 2. Test Faculty Management

### Create Faculty Profile
```bash
curl -X POST http://localhost:5000/api/faculty \
  -H "Content-Type: application/json" \
  -d '{
    "faculty_id": "F12345",
    "name": "Dr. John Doe",
    "department": "Computer Science & Engineering",
    "email": "john.doe@university.edu",
    "scholar_id": "scholar123",
    "designation": "Assistant Professor"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Faculty profile created successfully",
  "data": {
    "faculty_id": "F12345",
    "name": "Dr. John Doe",
    "department": "Computer Science & Engineering",
    "email": "john.doe@university.edu",
    "scholar_id": "scholar123",
    "designation": "Assistant Professor",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Faculty Profile
```bash
curl -X GET http://localhost:5000/api/faculty/F12345
```

---

## 3. Test Activities

### Create Activity
```bash
curl -X POST http://localhost:5000/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "faculty_id": "F12345",
    "type": "Workshop",
    "title": "Machine Learning Fundamentals",
    "date": "2024-01-15",
    "description": "A comprehensive workshop on ML basics",
    "proof_link": "https://example.com/proof.pdf"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Activity created successfully",
  "data": {
    "id": "auto-generated-id",
    "faculty_id": "F12345",
    "type": "Workshop",
    "title": "Machine Learning Fundamentals",
    "date": "2024-01-15",
    "description": "A comprehensive workshop on ML basics",
    "proof_link": "https://example.com/proof.pdf",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Faculty Activities
```bash
curl -X GET http://localhost:5000/api/activities/F12345
```

---

## 4. Test Publications

### Create Publication
```bash
curl -X POST http://localhost:5000/api/publications \
  -H "Content-Type: application/json" \
  -d '{
    "faculty_id": "F12345",
    "paper_title": "AI in Education: A Comprehensive Review",
    "journal_name": "IEEE Transactions on Learning",
    "year": "2024",
    "doi_link": "https://doi.org/10.1234/example",
    "citations": 5
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Publication created successfully",
  "data": {
    "id": "auto-generated-id",
    "faculty_id": "F12345",
    "paper_title": "AI in Education: A Comprehensive Review",
    "journal_name": "IEEE Transactions on Learning",
    "year": "2024",
    "doi_link": "https://doi.org/10.1234/example",
    "citations": 5,
    "status": "published",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Faculty Publications
```bash
curl -X GET http://localhost:5000/api/publications/F12345
```

---

## Console Output Examples

When running these requests, you should see console logs like:

```
🚀 Server is running on port 5000
📊 API ready at http://localhost:5000
✅ Firebase Admin initialized successfully

📝 Creating faculty profile
   Name: Dr. John Doe
   Department: Computer Science & Engineering
   Email: john.doe@university.edu
✅ Faculty profile created successfully
   Faculty ID: F12345

📝 Creating activity
   Faculty ID: F12345
   Type: Workshop
   Title: Machine Learning Fundamentals
✅ Activity created successfully
   Activity ID: abc123xyz

🔍 Fetching activities for faculty
   Faculty ID: F12345
✅ Activities fetched successfully
   Count: 1
```

---

## Error Handling

### Missing Required Fields
```bash
curl -X POST http://localhost:5000/api/faculty \
  -H "Content-Type: application/json" \
  -d '{
    "faculty_id": "F12345"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Faculty ID, name, department, and email are required"
}
```

### Faculty Not Found
```bash
curl -X GET http://localhost:5000/api/faculty/INVALID_ID
```

**Response:**
```json
{
  "success": false,
  "message": "Faculty profile not found"
}
```
