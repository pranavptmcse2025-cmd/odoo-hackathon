# EcoSphere Backend — Auth + Governance Module + Integration Layer

Node.js / Express / MongoDB backend for the EcoSphere ESG platform. Built to plug into
the existing EcoSphere React frontend and sit alongside the Environmental and Social
module backends built by the rest of the team.

## Stack
Node.js · Express.js · MongoDB · Mongoose · JWT · bcryptjs · dotenv · cors · axios

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run seed            # optional: creates a demo admin + sample governance data
npm run dev              # starts on http://localhost:5000
```

Demo admin login after seeding: **admin@ecosphere.com / Admin@123**

## Folder Structure
```
backend/
  config/db.js                 MongoDB connection
  controllers/                 Route handler logic
  routes/                      Express routers
  middleware/                  auth, admin, 404, global error handler
  models/                      User, Policy, Audit, ComplianceIssue
  utils/                       token helper, async wrapper, error class, seed script,
                                 integration client for Environmental/Social modules
  server.js                    App entry point
```

## Authentication
- `POST /api/auth/register` — name, email, password, department (role defaults to `employee`)
- `POST /api/auth/login` — email, password → returns JWT + user
- `POST /api/auth/logout` — (protected) client should discard the token
- `GET /api/auth/profile` — (protected) current user's profile

Send the JWT as `Authorization: Bearer <token>` on all protected routes.
Roles: `admin`, `employee`. Admin-only actions (create/update/delete policies & audits,
delete compliance issues) are enforced via the `adminOnly` middleware.

## Governance Module

| Resource | Routes |
|---|---|
| Policies | `GET/POST /api/policies`, `GET/PUT/DELETE /api/policies/:id` |
| Audits | `GET/POST /api/audits`, `GET/PUT/DELETE /api/audits/:id` |
| Compliance Issues | `GET/POST /api/issues`, `GET/PUT/DELETE /api/issues/:id` |

List endpoints support query filters, e.g. `GET /api/policies?department=IT&status=Active`.

## Dashboard & Reports

- `GET /api/dashboard/governance` — policy count, completed/pending audits, open/resolved issues
- `GET /api/reports/governance` — policy summary, audit summary (incl. average score), compliance summary by severity
- `GET /api/dashboard/overview` — aggregates governance + environment + social in one call

## Integration with the Environmental & Social Modules

This service proxies the other two modules so the frontend only needs one base URL:

- `GET /api/dashboard/environment`, `GET /api/reports/environment`
- `GET /api/dashboard/social`, `GET /api/leaderboard`, `GET /api/activities`

Set `ENV_MODULE_API_URL` and `SOCIAL_MODULE_API_URL` in `.env` to point at wherever those
modules are actually running (same server if all three teammates mount routes on one
Express app, or a different port/URL if they're deployed separately). If a module isn't
reachable, the proxy returns `502` with an `error` message instead of crashing — so the
dashboard degrades gracefully rather than breaking the whole page.

## Connecting the Frontend

The uploaded frontend currently uses static mock data in `src/data/*.js` (per its own
README) and has no `axios` calls yet. To wire it up:

1. `npm install axios` in the frontend project.
2. Add `VITE_API_URL=http://localhost:5000/api` to a `.env` file in the frontend root.
3. Copy `frontend-integration/api.js` (included alongside this backend) into the
   frontend at `src/api/client.js` — it's a ready-to-use axios instance with JWT
   attach/refresh-on-401 handling, plus commented examples for the Login page and a
   data page.
4. Replace each page's static import (e.g. `import { governanceData } from "../../data/governanceData"`)
   with a `useEffect` + `api.get(...)` call, matching the response shapes documented above.

**Note:** only the frontend's config files (`README.md`, `package.json`, `vite.config.js`,
`index.html`) were provided for this task — not the actual `src/` source (pages,
components, data files). Steps 1–4 above are ready to apply directly once you have
access to `src/pages/Governance`, `src/pages/Login`, etc.

## Middleware
- `protect` — verifies JWT, attaches `req.user`
- `adminOnly` / `authorize(...roles)` — role-based route guards
- `notFound` — 404 handler for unmatched routes
- `errorHandler` — global error handler (Mongoose CastError/ValidationError/duplicate-key,
  JWT errors, and generic `ApiError` all normalized to a consistent JSON shape)

## Deployment
1. Set `NODE_ENV=production` and a real `MONGO_URI` (MongoDB Atlas) in `.env`.
2. Build the frontend: `npm run build` (produces `frontend/dist`).
3. `server.js` already serves `frontend/dist` as static files and falls back to
   `index.html` for client-side routing when `NODE_ENV=production` — deploy the
   `backend/` folder with the built frontend one level up as `frontend/dist`
   (adjust the path in `server.js` if your repo layout differs).
4. Start with `npm start`.

## Testing Checklist
- [ ] Register + login return a valid JWT
- [ ] Protected routes reject requests without a token (401)
- [ ] Admin-only routes reject non-admin tokens (403)
- [ ] CRUD works for policies, audits, and compliance issues
- [ ] `/api/dashboard/governance` and `/api/reports/governance` return correct aggregates
- [ ] CORS allows the frontend origin set in `CLIENT_ORIGIN`
- [ ] Environment/Social proxy routes degrade gracefully if those services are down
