# PhishGuard AI

AI-Powered Phishing Detection & Security Awareness Platform

## Milestone 1 — Project Foundation

This milestone includes:
- Backend API with JWT authentication
- React frontend with landing page and dashboard
- User registration, login, and protected routes

## Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

Backend runs at: `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at: `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| GET | `/api/health` | Health check | No |

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- **AI (future):** Google Gemini API

## Project Structure

```
PhishGuard-AI/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   ├── uploads/        # File uploads (future)
│   └── server.js       # Entry point
└── frontend/
    └── src/
        ├── components/   # Reusable UI
        ├── context/      # Auth state
        ├── hooks/        # Custom hooks
        ├── layouts/      # Page layouts
        ├── pages/        # Route pages
        └── services/     # API calls
```

## License

MIT
