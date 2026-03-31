# CLAUDE.md — Full Stack Todo Application

## Project Overview
A full-stack todo application with user authentication, built with React (frontend) and Node/Express (backend), backed by PostgreSQL. Passwords are hashed with bcrypt. All core features are covered by unit tests. A GitHub Actions CI/CD pipeline runs on every push.

---

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router v6
- Axios for HTTP
- Vitest + React Testing Library for tests

**Backend**
- Node.js + Express
- PostgreSQL via `pg` (node-postgres)
- bcrypt for password hashing
- JSON Web Tokens (JWT) for auth
- Helmet, cors, express-rate-limit for security

**DevOps**
- GitHub Actions for CI/CD
- Docker + Docker Compose for local dev
- dotenv for environment config

---

## Project Structure

```
/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/             # Axios service layer
│   │   └── __tests__/
│   └── vite.config.js
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── db/              # Queries and migrations
│   │   └── __tests__/
│   └── jest.config.js
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
└── CLAUDE.md
```

---

## Commands

```bash
# Install all dependencies
npm install --workspaces

# Start full stack in development (uses Docker Compose for Postgres)
docker-compose up -d          # Start Postgres
npm run dev --workspace=server  # Start Express on :3001
npm run dev --workspace=client  # Start Vite on :5173

# Run all tests
npm run test --workspaces

# Run tests with coverage report
npm run test:coverage --workspaces

# Run database migrations
npm run migrate --workspace=server

# Build frontend for production
npm run build --workspace=client

# Lint all code
npm run lint --workspaces
```

---

## Core Features

All of these must remain functional at all times. Do not break them without updating tests.

1. **User registration** — email + password, password hashed with bcrypt (salt rounds: 12)
2. **User login** — returns signed JWT, stored in httpOnly cookie (not localStorage)
3. **Create todo** — title required, optional due date and priority
4. **List todos** — paginated, filterable by status (active / completed)
5. **Update todo** — toggle complete, edit title or due date
6. **Delete todo** — soft delete (sets `deleted_at`, never hard deletes)
7. **Protected routes** — all todo endpoints require valid JWT

---

## API Routes

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me             # Returns current user from JWT cookie (session restore)

GET    /api/todos              # ?page=1&limit=20&status=active
POST   /api/todos
GET    /api/todos/:id
PUT    /api/todos/:id
DELETE /api/todos/:id
```

All routes return JSON. Errors follow the shape: `{ "error": "message" }`.

---

## Database Schema

```sql
-- users
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
email         TEXT UNIQUE NOT NULL
password_hash TEXT NOT NULL            -- bcrypt hash, never plaintext
created_at    TIMESTAMPTZ DEFAULT now()

-- todos
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id       UUID REFERENCES users(id) ON DELETE CASCADE
title         TEXT NOT NULL
completed     BOOLEAN DEFAULT false
priority      TEXT CHECK (priority IN ('low','medium','high')) DEFAULT 'medium'
due_date      DATE
created_at    TIMESTAMPTZ DEFAULT now()
deleted_at    TIMESTAMPTZ             -- soft delete, NULL means active
```

---

## Testing

### Coverage Targets
- **Statements:** ≥ 80%
- **Branches:** ≥ 75%
- **Functions:** ≥ 80%

### What Must Be Tested

**Backend (Jest)**
- Auth controller: register (success, duplicate email, weak password), login (success, wrong password, unknown email)
- Todos controller: CRUD operations, ownership checks (user A cannot access user B's todos)
- Auth middleware: valid token passes, expired token rejected, missing token rejected
- Password hashing: ensure stored value is never plaintext, bcrypt.compare works correctly

**Frontend (Vitest + RTL)**
- LoginForm: renders, submits, shows validation errors
- TodoList: renders empty state, renders items, filters work
- TodoItem: toggle complete, delete fires correct handler
- API service layer: axios calls are mocked, error states handled

### Running Tests
```bash
# Backend tests with coverage
cd server && npm run test:coverage

# Frontend tests with coverage
cd client && npm run test:coverage
```

---

## Security Considerations

### Passwords
- Always hash with `bcrypt` at salt rounds ≥ 12 before storing
- Never log, return, or serialize `password_hash` in any response
- On login, use `bcrypt.compare()` — never decrypt or compare plaintext

### Authentication
- JWT signed with `HS256`, secret loaded from `JWT_SECRET` env var (min 32 chars)
- Token expiry: `1h` for access tokens
- Tokens stored in `httpOnly`, `Secure`, `SameSite=Strict` cookies — not localStorage or sessionStorage
- Logout clears the cookie server-side

### Input & Headers
- Validate and sanitize all request bodies (use `express-validator`)
- Use `helmet()` on all routes to set secure HTTP headers
- Apply `cors` with an explicit allowlist (`CORS_ORIGIN` env var)
- Apply `express-rate-limit` on auth routes: max 10 requests per 15 minutes per IP

### Environment
- Never commit `.env` files — always use `.env.example` with placeholder values
- Required env vars: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV`
- In production, `NODE_ENV=production` disables stack traces in error responses

### Ownership
- Every todo query must include `WHERE user_id = $userId` — never trust a client-supplied user ID
- Return `403 Forbidden` (not `404`) when a user tries to access another user's resource

---

## GitHub Actions — CI Workflow

File: `.github/workflows/ci.yml`

The pipeline runs on every push and pull request to `main`. It must pass before merging.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: todos_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgresql://testuser:testpass@localhost:5432/todos_test
      JWT_SECRET: a-long-test-secret-for-ci-at-least-32-chars
      NODE_ENV: test

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci --workspaces

      - name: Run migrations
        run: npm run migrate --workspace=server

      - name: Run backend tests with coverage
        run: npm run test:coverage --workspace=server

      - name: Run frontend tests with coverage
        run: npm run test:coverage --workspace=client

      - name: Build frontend
        run: npm run build --workspace=client

      - name: Lint
        run: npm run lint --workspaces
```

---

## GitHub Actions — CD Workflow

File: `.github/workflows/cd.yml`

Triggers automatically when the CI workflow completes successfully on `main`. Builds Docker images for both the server and client, then pushes them to the GitHub Container Registry (GHCR).

- **Server image:** `ghcr.io/<owner>/<repo>/server` — tagged with the short commit SHA and `latest`
- **Client image:** `ghcr.io/<owner>/<repo>/client` — tagged with the short commit SHA and `latest`
- Uses Docker layer caching (`cache-from`/`cache-to: gha`) to speed up builds
- Requires `GITHUB_TOKEN` (built-in) for GHCR authentication — no extra secrets needed

---

## Conventions

- Use `async/await` everywhere — no raw `.then()` chains
- Controllers are thin — business logic lives in service functions
- All DB queries are parameterised — no string interpolation with user input
- Use named exports — no default exports except React components
- File names: `camelCase.js` for modules, `PascalCase.jsx` for React components
- Commit messages: imperative mood, under 72 characters (e.g. `Add todo delete endpoint`)
- No `console.log` in committed code — use a logger (e.g. `morgan` for HTTP, `winston` for app logs)

---

## What NOT to Do

- Do not store passwords in plaintext, even temporarily
- Do not return `password_hash` in any API response
- Do not use `SELECT *` — always select explicit columns
- Do not trust `req.body.userId` for ownership — always read from the JWT payload
- Do not hard-delete todos — use soft delete (`deleted_at`)
- Do not merge if tests are failing or coverage drops below target
