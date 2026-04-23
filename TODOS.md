# TODOs — Skarbarber App

> Documento vivo. Se actualiza al cerrar cada tarea. Si se pierde el contexto de sesión, Claude lee este fichero para retomar.

**Última actualización:** 2026-04-23

---

## Estado actual

- Ventana de mantenimiento desplegada en Vercel (rama `maintenance`) y enlazada desde Google Business Profile.
- Proyecto Next.js 16 inicializado con Supabase, proxy de auth, páginas base (`/login`, `/(dashboard)`, `/reservar`).
- Base de datos Supabase operativa (proyecto `xuvylhymklzswesjeskm`), MCP conectado globalmente.
- Esquema inicial aplicado: `negocio`, `empleados`, `clientes`, `servicios`, `citas`, `recordatorios` + RLS.
- Seed aplicado: 1 negocio (Skarbarber) + 4 servicios.
- Flujo público `/reservar` completo (7 pasos) funcionando.
- RPC `crear_reserva_publica` (SECURITY DEFINER) resuelve limitaciones RLS del flujo anónimo.
- Preview desplegado en Vercel desde rama `feature/reservar-design`.
- Usuarios test:
  - `david.olid92@gmail.com` — propietario — pass `SkarTest2026!`
  - `test@skarbarber.local` — barbero

---

## Decisiones tomadas

- **Stack:** Next.js 16 + React 19 + TS + Tailwind v4 + shadcn/ui + Supabase.
- **Una BD por barbería** (no multi-tenant por ahora). Si abre otra sede se replica.
- **Idioma del esquema:** castellano.
- **Horario:** L-V 10-14h + 16-20h, Sáb 10-14h, Dom cerrado.
- **Servicios:** 30 min fijos. Dos barberos (Raúl + Darío), todos hacen todo.
- **Reservas sin login** (clientes anónimos), admin con login.
- **Recordatorios:** WhatsApp vía n8n + Twilio → Fase V1 (no MVP).

---

## Fase 0 — MVP funcional

### Público `/reservar`
- [x] Server Actions para reservas (`src/lib/actions/reservas.ts`).
- [x] Fuentes (Playfair Display + Inter) + tokens Tailwind (gold, dark).
- [x] Shell + ProgressBar + BackButton + GoldButton + GlassCard.
- [x] Reducer + BookingFlow con persistencia en `sessionStorage`.
- [x] Step 1 — Landing.
- [x] Step 2 — Elegir barbero (con "Me da igual").
- [x] Step 3 — Elegir servicio.
- [x] Step 4 — Elegir día (carousel).
- [x] Step 5 — Elegir hora (grid mañana/tarde).
- [x] Step 6 — Datos cliente (validación Zod).
- [x] Step 7 — Confirmación.
- [x] Fix RLS: policy pública de negocio + RPC `citas_ocupadas_del_dia`.
- [x] Fix RLS: RPC `crear_reserva_publica` para upsert cliente + insert cita.
- [x] Prueba end-to-end en producción (preview Vercel).
- [ ] Validación de slots a nivel DB (constraint o trigger) para evitar doble reserva en carrera.
- [ ] Decisión política formato teléfono (+34 o libre).

### Dashboard admin `/(dashboard)`

> Ver desglose completo en [PLAN-DASHBOARD.md](PLAN-DASHBOARD.md).

**Fase 0 — Shell**
- [ ] Resolver conflicto de rutas `/` (ver PLAN-DASHBOARD).
- [ ] Layout dashboard con identidad gold + Playfair + bottom nav móvil + sidebar desktop.
- [ ] Componentes base: `GlassPanel`, `GoldBadge`, `StatCard`, `DataTable`, `EmptyState`.

**Fase 1 — Agenda (core)**
- [ ] Vista día con timeline vertical (tramos mañana/tarde).
- [ ] Tarjeta glass por cita (hora, cliente, servicio, tap-to-call).
- [ ] Filtros por empleado (Todos / Raúl / Darío).
- [ ] Navegación por fechas (swipe + flechas + date picker).
- [ ] FAB "+ Cita manual".
- [ ] Estados visuales: confirmada / completada / cancelada.
- [ ] Sheet de detalle con acciones (editar, cancelar, completar).
- [ ] Server actions: `getCitasDelDia`, `actualizarCita`, `cancelarCita`.

**Fase 2 — Crear cita manual**
- [ ] Flow admin multi-step con autocomplete de clientes.
- [ ] Opción walk-in (cliente sin registrar).
- [ ] Server action `crearCitaManual`.

**Fase 3 — Clientes**
- [ ] Listado ordenado por última visita + búsqueda con debounce.
- [ ] Ficha cliente: historial, total gastado, nota interna.
- [ ] Acciones: llamar, WhatsApp, nueva cita.
- [ ] Server actions CRUD clientes.

**Fase 4 — Servicios / Empleados / Config**
- [ ] CRUD servicios (nombre, duración, precio, activo).
- [ ] CRUD empleados (solo owner).
- [ ] Editor de horario laboral por día.
- [ ] Datos fiscales negocio.

**Fase 5 — KPIs (opcional MVP)**
- [ ] 4 KPI cards (hoy, semana, ingresos mes, clientes nuevos).
- [ ] Gráfico ocupación semanal.
- [ ] Top clientes + Top servicios.

**Fase 6 — PWA + notificaciones**
- [ ] `manifest.json` + iconos.
- [ ] Service worker básico.
- [ ] Push al barbero en nueva reserva (Supabase Realtime).

### Infra
- [ ] Merge `feature/reservar-design` → `main` para sustituir ventana de mantenimiento en producción.

---

## Fase 1 — Datos reales

- [ ] Confirmar con Raúl lista definitiva de servicios y precios.
- [ ] Confirmar política de cancelación (antelación mínima).
- [ ] Actualizar seed con datos reales.
- [ ] Crear usuarios reales de Raúl y Darío en Supabase Auth.
- [ ] Fotos reales de Raúl y Darío para `empleados.avatar_url`.
- [ ] Comprar dominio (`skarbarber.com` / `.es`) — ~12 €/año.

---

## Fase 2 — Emails transaccionales

- [ ] Elegir proveedor (Brevo free sin dominio, o Resend + dominio propio).
- [ ] Plantilla de confirmación de cita al cliente (HTML estilo negro+dorado).
- [ ] Email interno al barbero cuando entra nueva reserva.
- [ ] Disparo desde `crearReserva` tras éxito.

---

## Fase 3 — Recordatorios WhatsApp

- [ ] Iniciar verificación de WhatsApp Business.
- [ ] Workflow n8n que consulta `recordatorios` pendientes y envía vía Twilio.
- [ ] Marcar `enviado_en` / `estado` tras envío.
- [ ] Job programado (cron) para generar recordatorios 24h antes de cada cita.

---

## Fase 4 — Pulido

- [ ] PWA installable (manifest + service worker).
- [ ] Notificaciones push al barbero (nueva reserva).
- [ ] Estadísticas básicas (citas/mes, clientes recurrentes).
- [ ] "Añadir a calendario" en Step 7 (.ics / deep link Google Calendar).
- [ ] Link de cancelación público (`/cancelar/[token]`).
- [ ] Sync de estado a URL en `/reservar` (compartir link del paso N).
- [ ] Migrar proyecto Supabase de cuenta personal a cuenta del negocio (si procede).

---

## Fase 5 — SaaS-ready (solo si funciona)

- [ ] Evaluar multi-tenant (añadir `negocio_id` a todas las tablas + RLS por tenant).
- [ ] Onboarding self-service para nuevas barberías.
- [ ] Facturación (Stripe).

---

## Pendientes con Raúl

- Precios finales de servicios.
- Política de cancelación.
- Teléfonos de Raúl y Darío para los perfiles.
- Decisión sobre dominio propio y nombre exacto.
- Cuándo migrar de la cuenta Supabase personal a una del negocio.

---

## Ficheros clave

- [CLAUDE.md](CLAUDE.md) — contexto permanente del proyecto.
- [COSTES.md](COSTES.md) — registro de gastos y suscripciones.
- [PLAN-DASHBOARD.md](PLAN-DASHBOARD.md) — plan detallado del dashboard admin.
- [AGENTS.md](AGENTS.md) — aviso sobre Next.js 16 (breaking changes).
- [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql) — esquema.
- [supabase/migrations/002_reserva_publica_rpc.sql](supabase/migrations/002_reserva_publica_rpc.sql) — RPC reserva pública.
- [supabase/seed.sql](supabase/seed.sql) — datos iniciales.
- [src/lib/types.ts](src/lib/types.ts) — tipos TS del esquema.
- [src/lib/supabase/](src/lib/supabase/) — clientes Supabase.
- `.env.local` — credenciales (NO commitear).
