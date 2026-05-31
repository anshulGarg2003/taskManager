# AI Manager Frontend

Frontend application for the AI Manager platform.

Built with React + Vite + TailwindCSS, with routing, Redux state management, and Auth0 authentication.

## Platform Brief

AI Manager is a student-teacher academic productivity platform focused on planning, learning, tracking, and classroom coordination.

On the student side, it combines day and weekly planning, study tools, quiz practice, performance analytics, exam writing/submission support, and goal tracking.

On the teacher/admin side, it provides class management, announcements, holiday request handling, submissions review, and a Teacher Control Center for actions like extra classes, reschedules, tests, and targeted interventions.

## Key Features

- Secure authentication and session-based protected routes with Auth0
- Student productivity suite: day planner, weekly planner, calendar, study timer, and goals
- Quiz workflow: attempt quizzes, track scores, and monitor progress trends
- Analytics dashboard and leaderboard for performance visibility
- Scribble exam workflow with submission and review flows
- Role-aware profiles for students and teachers
- Teacher/Admin tools:
	- user management
	- question and quiz management
	- submission review queue
	- announcements and holiday workflows
	- Teacher Control Center for multi-class operations and action scheduling

## Tech Stack

- React 18
- Vite 5
- TailwindCSS
- Redux Toolkit
- React Router
- Auth0

## Project Path

Folder name in this repository:

`aimanger_frontend`

## Prerequisites

- Node.js 18+ (recommended Node.js 20)
- npm 9+

## Environment Variables

Create a `.env` file inside this folder and configure:

```env
VITE_ENVIRONMENT=local
VITE_DOMAIN=your-auth0-domain
VITE_CLIENT_ID=your-auth0-client-id
```

Notes:

- `VITE_ENVIRONMENT=local` makes API base URL point to `http://localhost:5001`.
- Any other value uses the hosted backend URL configured in `src/utlis/API_calls.js`.

## Install

```bash
npm install
```

## Run (Development)

```bash
npm run dev
```

Default dev URL:

`http://localhost:5173`

## Build (Production)

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - create production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Docker (Frontend only)

From this folder:

```bash
docker build -t aimanager-frontend .
docker run -p 5173:80 aimanager-frontend
```

## Run With Full Platform (Recommended)

From repository root:

```bash
docker compose up --build -d
```

Then open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

## Important Directories

- `src/components` - student-facing UI and shared pages
- `src/admin` - admin and teacher control pages
- `src/redux` - Redux store and slices
- `src/utlis` - API and utility helpers

