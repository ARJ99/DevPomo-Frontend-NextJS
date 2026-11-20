<div align="center">

# DevPomo — Frontend

**A pomodoro task manager built with Next.js**

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-installed-000)](https://ui.shadcn.com)

*The frontend companion of the [DevPomo Backend (NestJS)](../Backend/README.md)*

</div>

---

## Overview

DevPomo is a pomodoro app that developers use to track tasks. This frontend is the user-facing layer: it renders every task stored in the database inside a central card, lets you search them by title or id, and exposes per-task actions (update, delete) through a dropdown menu.

- **No data layer of its own** — the frontend is stateless by design; all tasks live in PostgreSQL and are served by the NestJS API
- **Plain `fetch` + React hooks** — no TanStack Query, no SWR; a small typed client (`lib/api.ts`) handles all HTTP
- **shadcn/ui components** — card, input, dropdown-menu, button, badge, on top of Tailwind CSS 4

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | 16 | React framework (App Router) |
| [React](https://react.dev) | 19 | UI runtime |
| [TypeScript](https://www.typescriptlang.org) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | 4 (turbopack) | Styling |
| [shadcn/ui](https://ui.shadcn.com) | latest | UI primitives (Radix-based) |
| [lucide-react](https://lucide.dev) | — | Icons |

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout (fonts, metadata)
│   ├── page.tsx            # Main page: gradient bg, DevPomo card, task grid
│   └── globals.css         # Theme variables (shadcn), Tailwind directives
├── components/
│   ├── search-bar.tsx      # Search by title or id (client-side filter)
│   ├── task-card.tsx       # Single task card with settings dropdown
│   └── ui/                 # shadcn primitives (card, input, dropdown-menu, …)
├── lib/
│   ├── api.ts              # Typed fetch client for the Nest API
│   ├── types.ts            # Task interface + TaskStatus union
│   └── utils.ts            # cn() helper (shadcn)
├── .env.local              # NEXT_PUBLIC_API_URL
└── components.json         # shadcn configuration
```

## Getting Started

### Prerequisites

- **The backend must be running first** — see the [Backend README](../Backend/README.md) for its setup (Docker PostgreSQL, Prisma migrations, seed). The backend listens on **port 3002** by default.
- Node.js 18+ and npm

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

> Restart `npm run dev` after changing this file — `NEXT_PUBLIC_*` variables are inlined at build time.

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the frontend dev server runs on **port 3000**, the backend on **port 3002**.

### Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server (turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Architecture: How the Frontend Talks to the Backend

```
┌─────────────────────┐         HTTP (JSON)         ┌──────────────────────┐
│  Next.js :3000      │  ─────────────────────────▶ │  NestJS :3002        │
│                     │   /api/tasks (GET/POST/     │                      │
│  lib/api.ts         │   PATCH/DELETE)             │  Prisma → Postgres   │
│  typed client       │ ◀─────────────────────────  │  :5434               │
└─────────────────────┘         Task[] JSON          └──────────────────────┘
```

- All HTTP goes through a single typed wrapper (`lib/api.ts`) that adds the `Content-Type` header, unwraps error bodies (`{ message, error, statusCode }` from Nest), and throws real `Error` objects for non-2xx responses.
- CORS is enabled on the backend with `origin: http://localhost:3000` (`Backend/src/main.ts`), so cross-origin calls from this app are allowed.
- The API is globally prefixed with `api` (`setGlobalPrefix`), which is why the base URL ends in `/api` — don't repeat it in the paths.

### The typed API client

```ts
import { api } from "@/lib/api";

const tasks = await api.getTasks();                       // GET  /api/tasks
const one   = await api.getTask(4);                       // GET  /api/tasks/4
const made  = await api.createTask({ title: "..." });     // POST /api/tasks
const upd   = await api.updateTask(4, { status: "COMPLETED" }); // PATCH
await api.deleteTask(4);                                  // DELETE /api/tasks/4
```

Every call returns the parsed JSON typed as `Task` (or `Task[]`), and every rejection is an `Error` carrying the backend's `message` — call sites handle it with `.catch()` / `try-catch` and surface it in the UI.

## Key Frontend Concepts

### State model (main page)

The main page keeps **two lists**:

- `allTasks` — the pristine list from the API
- `visibleTasks` — what the grid renders, after the search filter

The search bar only reports the query string; the page filters from `allTasks`. This means clearing the search box always restores the full list — the filter is never applied on top of a previous filter.

### API contract rules

When sending data to the backend, the frontend must respect:

- **Validation is strict** (`forbidNonWhitelisted: true`) — only send `title`, `description`, `status`. Never send `id`, `createdAt`, or `updatedAt`; the backend rejects unknown fields with `400`.
- **Status values are `IN_PROGRESS` / `COMPLETED`** — uppercase, no spaces. (The database stores `"In Progress"` / `"Completed"` via `@map`, but that spelling is never sent over HTTP.)
- **Timestamps are automatic** — `createdAt`/`updatedAt` are managed by Prisma (`@default(now())` / `@updatedAt`), never sent by the frontend.

## UI Features

- **Gradient background** — `bg-gradient-to-r from-slate-300 to-slate-500`
- **Central DevPomo card** — rounded-3xl, blurred backdrop, bundles the whole task grid
- **Task cards** — id, title, description, status badge, created/updated dates; 4 per row (`sm:grid-cols-2 lg:grid-cols-4` for responsiveness)
- **Search bar** — filters by title substring or exact id
- **Settings dropdown** — ⋮ icon at each card's top-right with Update / Delete actions (Delete is wired to the API; Update is currently a stub)

## Roadmap

- [ ] Wire the **Update** dropdown item to an edit dialog
- [ ] Create-task form (the `api.createTask` client method already exists)
- [ ] Pomodoro timer per task (the core DevPomo feature)
- [ ] Toast notifications for mutations (e.g. sonner)
- [ ] Loading skeletons instead of the bare grid

## Related

- **Backend README** — [`../Backend/README.md`](../Backend/README.md): API reference, data model, migrations, seed
- **Stack**: NestJS 12 · Prisma 7 · PostgreSQL 17 (Docker, port 5434)
