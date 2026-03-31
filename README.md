# AI Catalyst — Full Stack Todo App

A full-stack todo application with user authentication, built as a reference implementation for a modern React + Node/Express stack backed by PostgreSQL.

## Features

- **Auth** — register, login, and logout with JWT stored in httpOnly cookies
- **Todos** — create, edit, toggle complete, and delete todos (soft delete)
- **Filtering** — filter todos by active or completed status
- **Pagination** — paginated todo list
- **Priority & due dates** — assign low/medium/high priority and an optional due date
- **Protected routes** — all todo endpoints require a valid session
- **Security** — helmet, CORS allowlist, bcrypt password hashing, rate limiting on auth routes

## Tech Stack

**Frontend** — React 18, Vite, React Router v6, Axios

**Backend** — Node.js, Express, PostgreSQL (`pg`), bcrypt, JSON Web Tokens

**Testing** — Vitest + React Testing Library (frontend), Jest + Supertest (backend)

**DevOps** — Docker Compose (local Postgres), GitHub Actions CI/CD

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for local Postgres)

### Install dependencies

```bash
npm install --workspaces
```

### Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set a strong `JWT_SECRET` (minimum 32 characters). The other defaults work for local development.

### Start Postgres

```bash
docker-compose up -d
```

### Run database migrations

```bash
npm run migrate --workspace=server
```

### Start the development servers

```bash
npm run dev:server   # Express API on http://localhost:3001
npm run dev:client   # Vite dev server on http://localhost:5173
```

Open `http://localhost:5173`, register an account, and start adding todos.

## Running Tests

```bash
# All tests
npm run test --workspaces

# With coverage reports
npm run test:coverage --workspaces
```

Coverage targets: ≥ 80% statements, ≥ 75% branches, ≥ 80% functions.

## API Overview

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/todos?page=1&limit=20&status=active
POST   /api/todos
GET    /api/todos/:id
PUT    /api/todos/:id
DELETE /api/todos/:id
```

All responses are JSON. Errors return `{ "error": "message" }`.

## Project Structure

```
├── client/          # React frontend (Vite)
│   └── src/
│       ├── api/         # Axios service layer
│       ├── components/
│       ├── context/     # AuthContext
│       ├── hooks/       # useTodos, useAuth
│       └── pages/
│
├── server/          # Express backend
│   └── src/
│       ├── controllers/
│       ├── db/          # Pool, migrations
│       ├── middleware/  # JWT auth, error handler
│       └── routes/
│
├── docker-compose.yml
└── .env.example
```
