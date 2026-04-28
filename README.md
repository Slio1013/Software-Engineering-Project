# Professor Feedback System

React + Node.js + Express + MongoDB  
Group 50 — Mahindra University

---

## Project Structure

```
professor-feedback/
├── backend/          Node/Express API
│   ├── models/       Mongoose schemas (User, Course, Attendance, Feedback)
│   ├── routes/       auth, courses, feedback, professor, admin
│   ├── middleware/   JWT auth
│   └── server.js
└── frontend/         React app
    └── src/
        ├── pages/    Login, StudentDashboard, FeedbackForm, ProfessorDashboard, Admin*
        ├── components/  Navbar, StarRating
        ├── context/  AuthContext
        └── api.js
```

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

---

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set your MONGODB_URI and a JWT_SECRET
npm install
npm run dev       # starts on http://localhost:5000
```

---

### 2. Frontend

```bash
cd frontend
npm install
npm start         # starts on http://localhost:3000
```

The frontend proxies `/api` requests to `localhost:5000` (set in package.json).

---

## Seed Data (Quick Start)

Use the API to create your first admin account:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"studentId":"ADMIN001","name":"Admin","email":"admin@mu.edu","password":"admin123","role":"admin"}'
```

Then log in at http://localhost:3000 with `Slio` / `123456`.

From the admin panel you can:
1. Add professors (Admin → Professors)
2. Add courses with modules (Admin → Courses)
3. Register students via the `/api/auth/register` endpoint with `"role":"student"`
4. Enroll students + set attendance via:

```bash
# Get a JWT first (login as admin), then:
curl -X POST http://localhost:5000/api/admin/enroll \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"<mongoId>","courseId":"<mongoId>","attendancePercentage":85}'
```

---

## Roles & Access

| Role | Access |
|------|--------|
| student | Dashboard, feedback form (if attendance ≥ 75%) |
| professor | Aggregated feedback reports for their courses |
| admin | Full CRUD on courses/professors, feedback monitoring |

---

## Feedback Flow

1. Student logs in
2. Dashboard shows enrolled courses + attendance %
3. If eligible (≥75%), student can open the 5-step feedback form:
   - Step 1: Teaching Effectiveness (5 questions)
   - Step 2: Engagement & Communication (3 questions)
   - Step 3: Assessment & Feedback (4 questions)
   - Step 4: Overall Experience (3 questions + comments)
   - Step 5: Course Outcome coverage
     - "Everything covered" → submit immediately
     - Else: tick which modules met expectations
     - Unticked modules → grievance text boxes → submit
4. Feedback stored anonymously (SHA-256 hash of studentId+courseId, not the ID itself)
5. Duplicate submissions blocked at DB level

---

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios
- **Backend**: Node.js, Express 4, Mongoose 7
- **Database**: MongoDB (via Mongoose)
- **Auth**: JWT (jsonwebtoken), bcryptjs
- **Anonymity**: SHA-256 hash stored instead of student reference
