@AGENTS.md

# SkarbarberApp

## Project Overview
Appointment booking and management app for barbershops. MVP for Skarbarber (Alcalá de Henares, Madrid). Designed as multi-tenant SaaS from day one.

## Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Supabase (PostgreSQL) with RLS for multi-tenant isolation
- **Auth**: Supabase Auth (email+password, no public signup)
- **Icons**: lucide-react
- **Deploy**: Vercel

## Architecture
- `src/app/(dashboard)/` — Admin panel (auth required): agenda, clients, services, config
- `src/app/reservar/` — Public booking page (no auth): clients book their own appointments
- `src/app/login/` — Login page for barbers/owners only
- `src/lib/supabase/` — Supabase client (browser, server, middleware)
- `src/lib/actions/` — Server Actions for CRUD operations
- `src/lib/types.ts` — TypeScript types matching DB schema
- `supabase/migrations/` — SQL migrations
- RLS policies enforce tenant isolation at DB level

## Business Rules
- Two barbers: Raúl (owner) and Darío (barber)
- All barbers perform all services
- All services are 30 minutes fixed duration
- Clients book via public `/reservar` page: choose barber → service → day → available slot
- Admin panel is PWA installable on barber's phone
- Reminders via WhatsApp (n8n + Twilio) — Phase V1

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint

## Environment Variables
Copy `.env.local.example` to `.env.local` and fill in Supabase credentials.
