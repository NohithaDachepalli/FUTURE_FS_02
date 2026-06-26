# LeadFlow CRM

A modern full-stack CRM for managing website contact-form leads, follow-ups, notes, analytics, and secure admin workflows.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, React Router
- Backend: Node.js, Express, MongoDB/Mongoose
- Auth: JWT with bcrypt password hashing
- Security: Helmet, CORS, rate limiting, validation, environment secrets
- Deployment: Vercel frontend, Render/Railway backend

## Project Structure

```txt
client/   React dashboard and public contact form
server/   Express API, MongoDB models, auth, seed script
```

## Quick Start

### 1. Backend

```bash
cd server
cp .env
npm install
npm run seed
npm run dev
```

Default seeded admin:

```txt
Email: admin@leadflowcrm.com
Password: Admin@12345
```

### 2. Frontend

```bash
cd client
cp .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

Backend `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/leadflow_crm
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
ADMIN_EMAIL=admin@leadflowcrm.com
```

Frontend `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Email notifications are optional. If SMTP variables are empty, submissions are saved and email delivery is skipped gracefully.

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `POST /api/auth/change-password`
- `GET /api/leads`
- `GET /api/leads/:id`
- `POST /api/leads`
- `PUT /api/leads/:id`
- `DELETE /api/leads/:id`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `DELETE /api/notes/:id`
- `POST /api/followups`
- `PUT /api/followups/:id`
- `GET /api/analytics/summary`
- `GET /api/reports/leads.csv`
- `GET /api/reports/leads.xls` for Excel-compatible export
- `POST /api/public/contact`

## Deployment

### Frontend on Vercel

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL=https://your-api.onrender.com/api`

### Backend on Render/Railway

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Add `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and optional SMTP variables.

## Features

- JWT admin authentication and protected routes
- Responsive dark/light dashboard shell with sidebar navigation
- Lead CRUD with search, filters, sorting, pagination-ready API shape
- Lead details with status timeline, notes, activity history, and follow-ups
- Kanban pipeline view with drag-and-drop status updates
- Analytics cards, charts, conversion trends, source distribution
- Upcoming and overdue follow-up widgets
- Public contact form that creates CRM leads and can send emails
- CSV and Excel-compatible exports
- Admin profile and password management
