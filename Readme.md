# Service Provider Onboarding Portal

A MERN stack app where service providers register, complete their profile,
upload documents and submit an application, and an admin reviews and
approves/rejects each application.

## Stack
- React (Vite) + React Router
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication, role-based access (provider / admin)
- Multer for file uploads

## Folder Structure
```
onboarding-portal/
  backend/
    config/        DB connection
    models/        User, Provider schemas
    middleware/     auth (JWT), upload (multer)
    controllers/    auth, provider, admin logic
    routes/         auth, provider, admin routes
    uploads/         uploaded files (photo/docs) served statically
    server.js
  frontend/
    src/
      api/          axios instance with auth interceptor
      context/       AuthContext (login/logout/session)
      components/    Navbar, ProtectedRoute
      pages/         Home, Login, Register, ProviderDashboard, AdminDashboard, ProviderDetail
```

## Setup

### Backend
```
cd backend
npm install
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm run dev                # starts on http://localhost:5000
```

Create an admin account:
```
node seedAdmin.js
```
Default admin login (unless overridden via ADMIN_EMAIL/ADMIN_PASSWORD env vars):
`admin@onboarding.com` / `admin123`

### Frontend
```
cd frontend
npm install
cp .env.example .env
npm run dev                # starts on http://localhost:5173
```

## How It Works

**Provider**
1. Register → auto-logged in, empty profile created.
2. Fill profile: categories, skills, experience, location.
3. Upload a profile photo and at least one verification document.
4. Submit application → status becomes `pending`.
5. Profile is locked from editing while `pending`; unlocked again if `rejected`
   so they can fix and resubmit. Fully locked once `approved`.

**Admin**
1. Login with the seeded admin account.
2. Dashboard shows counts by status (total/pending/approved/rejected/incomplete).
3. Provider list supports search (name/email/skill/city), status filter and pagination.
4. Open a provider to view full profile + uploaded documents.
5. Approve, or reject with a required remark (shown back to the provider).

## API Overview

| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Authenticated |
| GET | /api/provider/profile | Provider |
| PUT | /api/provider/profile | Provider |
| POST | /api/provider/photo | Provider |
| POST | /api/provider/documents | Provider |
| POST | /api/provider/submit | Provider |
| GET | /api/admin/providers | Admin |
| GET | /api/admin/providers/:id | Admin |
| PUT | /api/admin/providers/:id/approve | Admin |
| PUT | /api/admin/providers/:id/reject | Admin |
| GET | /api/admin/stats | Admin |

## Notes
- Validation is done both client-side (basic) and server-side (required fields,
  file type/size limits on uploads, status transition checks).
- Errors are handled centrally in `server.js` and returned as JSON with a message.
- Environment variables are used for DB URI, JWT secret, port and client URL —
  none are hardcoded.
