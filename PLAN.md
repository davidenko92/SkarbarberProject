# Plan de acción — Skarbarber App

> Documento vivo. Actualizar al cerrar cada tarea. Si se pierde el contexto de sesión, Claude lee este fichero para retomar.

## Estado actual (2026-04-18)

- Ventana de mantenimiento desplegada en Vercel (rama `maintenance`) y enlazada desde Google Business Profile.
- Proyecto Next.js 16 inicializado con Supabase, middleware de auth, páginas base (`/login`, `/(dashboard)`, `/reservar`).
- Base de datos Supabase creada (proyecto `xuvylhymklzswesjeskm`), MCP conectado globalmente.
- Esquema inicial aplicado: `negocio`, `empleados`, `clientes`, `servicios`, `citas`, `recordatorios` + RLS.
- Seed aplicado: 1 negocio (Skarbarber) + 4 servicios.
- Usuarios de test creados (sin notificar a Raúl/Darío):
  - `david.olid92@gmail.com` — propietario
  - `test@skarbarber.local` — barbero
  - Password compartida: `SkarTest2026!`

## Decisiones tomadas

- **Stack**: Next.js 16 + React 19 + TS + Tailwind v4 + shadcn/ui + Supabase.
- **Una BD por barbería** (no multi-tenant). Si en el futuro abre otra sede, se replica.
- **Idioma del esquema**: castellano.
- **Horario**: L-V 10-14h + 16-20h, Sáb 10-14h, Dom cerrado.
- **Servicios**: 30 min fijos. Dos barberos (Raúl + Darío), todos hacen todo.
- **Reservas sin login** (clientes anónimos), admin con login.
- **Recordatorios**: WhatsApp vía n8n + Twilio → Fase V1 (no MVP).

## TODOs por fase

### Fase 0 — Cerrar MVP funcional (ahora)

- [ ] Arrancar `npm run dev` y verificar login con usuario test.
- [ ] Construir página pública `/reservar`:
  - [ ] Paso 1: seleccionar barbero.
  - [ ] Paso 2: seleccionar servicio.
  - [ ] Paso 3: seleccionar día (calendario con días disponibles según `horario_laboral`).
  - [ ] Paso 4: seleccionar hora (slots de 30 min, excluyendo ocupados).
  - [ ] Formulario cliente (nombre, teléfono, email opcional).
  - [ ] Insert en `clientes` (upsert por teléfono) + `citas`.
  - [ ] Pantalla de confirmación.
- [ ] Construir dashboard (admin):
  - [ ] Vista agenda (día/semana) con citas del barbero logueado.
  - [ ] Crear cita manual.
  - [ ] Editar/cancelar cita.
  - [ ] CRUD clientes.
  - [ ] CRUD servicios.
  - [ ] Configuración del negocio (horario, datos).
- [ ] Server Actions para todas las operaciones CRUD en `src/lib/actions/`.
- [ ] Validación de slots (evitar doble reserva) a nivel DB (constraint o trigger).

### Fase 1 — Datos reales

- [ ] Confirmar con Raúl lista definitiva de servicios y precios.
- [ ] Confirmar política de cancelación (antelación mínima).
- [ ] Actualizar seed con datos reales.
- [ ] Crear usuarios reales de Raúl y Darío en Supabase Auth.

### Fase 2 — Recordatorios WhatsApp

- [ ] Iniciar verificación de WhatsApp Business.
- [ ] Workflow n8n que consulta `recordatorios` pendientes y envía vía Twilio.
- [ ] Marcar `enviado_en` / `estado` tras envío.
- [ ] Job programado (cron) para generar recordatorios 24h antes de cada cita.

### Fase 3 — Pulido

- [ ] PWA installable (manifest + service worker).
- [ ] Notificaciones push al barbero (nueva reserva).
- [ ] Estadísticas básicas (citas/mes, clientes recurrentes).
- [ ] Logo + branding aplicado al dashboard.
- [ ] Migrar proyecto Supabase de cuenta personal a cuenta del negocio (si procede).

### Fase 4 — SaaS-ready (solo si funciona)

- [ ] Evaluar multi-tenant (añadir `negocio_id` a todas las tablas + RLS por tenant).
- [ ] Onboarding self-service para nuevas barberías.
- [ ] Facturación (Stripe).

## Pendientes con Raúl

- Precios finales de servicios.
- Política de cancelación.
- Teléfonos de Raúl y Darío para los perfiles.
- Cuándo migrar de la cuenta Supabase personal de David a una cuenta del negocio.

## Ficheros clave

- `CLAUDE.md` — contexto permanente del proyecto.
- `supabase/migrations/001_initial_schema.sql` — esquema.
- `supabase/seed.sql` — datos iniciales.
- `src/lib/types.ts` — tipos TS del esquema.
- `src/lib/supabase/` — clientes Supabase.
- `.env.local` — credenciales (NO commitear).
