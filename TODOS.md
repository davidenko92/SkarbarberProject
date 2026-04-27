# TODOs — Skarbarber App

> Documento vivo. Se actualiza al cerrar cada tarea. Si se pierde el contexto de sesión, Claude lee este fichero para retomar.

**Última actualización:** 2026-04-26 (login server action + PWA fallback iOS + icono gorila + constraint anti doble-reserva + email transaccional Gmail SMTP)

---

## Estado actual

- Ventana de mantenimiento desplegada en Vercel (rama `maintenance`) y enlazada desde Google Business Profile.
- Proyecto Next.js 16 inicializado con Supabase, proxy de auth, páginas base (`/login`, `/panel`, `/reservar`).
- Base de datos Supabase operativa (proyecto `xuvylhymklzswesjeskm`), MCP conectado globalmente.
- Esquema inicial aplicado: `negocio`, `empleados`, `clientes`, `servicios`, `citas`, `recordatorios` + RLS.
- Seed aplicado: 1 negocio (Skarbarber) + 4 servicios.
- Flujo público `/reservar` completo (7 pasos) funcionando.
- **Cards `/reservar` rediseñadas**: glass refinado + Playfair en títulos con gradient dorado en `<em>` + hairlines editoriales + sombras multicapa para armonizar con silk bg animado.
- **Panel admin `/panel` Fase 0 completa**: shell mobile-first con header gorila (36px), bottom nav 4 items, agenda del día con StatCards, lista de citas, efecto `pulse-gold` en siguiente cita, FAB con shimmer.
- **Panel admin Fase 1 Agenda core completa**: navegador de fechas con chip "Hoy", filtro por barbero (pill tabs), bottom sheet de detalle con acciones (completar/no-vino/cancelar), tap-to-call + WhatsApp, estados visuales diferenciados por estado de cita, server actions `getCitasDelDia` + `actualizarEstadoCita`.
- **Panel admin Fase 2 Crear cita manual completa**: FAB abre bottom sheet multi-step (barbero → servicio → día → hora → cliente), autocomplete de clientes existentes con debounce, tres tipos de cliente (Buscar / Nuevo / Sin datos), cliente nuevo con upsert por teléfono, server actions `buscarClientes` + `crearCitaManual`.
- **Panel admin Fase 3 Clientes completa**: listado con búsqueda debounced + ordenado por última visita + contador de citas + total gastado, ficha con avatar + stats (visitas/citas/gastado) + historial cronológico + edición inline (teléfono/email/notas) + eliminación con confirmación, server actions `listarClientes` + `getClienteConHistorial` + `actualizarCliente` + `eliminarCliente`.
- **Panel admin Fase 4 Servicios completa**: CRUD completo con bottom sheet (nombre/duración/precio/activo/orden), toggle dorado iOS-style, eliminar con confirmación inline, server actions `listarServicios` + `crearServicio` + `actualizarServicio` + `eliminarServicio`.
- **Panel admin Fase 4 Config completa**: `/panel/config` con `NegocioForm` (nombre/teléfono/dirección) + `HorarioEditor` de 7 días con tramos múltiples (toggle abierto/cerrado, inputs time, hasta 3 tramos por día, default 10-14 / 16-20) + `EmpleadosAdminList` con RBAC (propietario edita a todos, barbero solo su propio perfil) + `EmpleadoEditSheet` (nombre/teléfono/avatar/activo). Server actions `getNegocio`, `actualizarNegocio`, `listarEmpleados`, `actualizarEmpleado`, `getUsuarioActual` con `requirePropietario`. Migración `003_negocio_update_policy` añade RLS UPDATE para propietario; updates blindados con `.select("id")` para detectar 0 filas afectadas.
- **Panel admin Fase 5 Métricas completa**: `/panel/metricas` (5º item del bottom nav) con 4 KPI cards (citas hoy / semana / ingresos mes / clientes nuevos) + barras CSS de ocupación semanal por día + Top 5 clientes (por nº citas y total gastado) + Top 5 servicios del mes (veces vendido + ingresos). Ingresos del mes solo visibles para propietario (`null` para barbero, mostrado como "—"). Server actions `metricas.ts`: `getKpis`, `getOcupacionSemanal`, `getTopClientes`, `getTopServiciosMes`.
- **Cards `/reservar` pulidas**: `.edge-card` rediseñada con wash dorado cálido + lateral warm glints + hairlines luminosos top/bottom + variantes (`--solid` / `--subtle`) + glint de hover; nueva primitiva `.edge-tile` (con variante `--selected` en gradiente dorado) unifica botones día/hora con el lenguaje de las cards; `StepHeading` con rule extendido (88px) y dot dorado luminoso; padding/spacing armonizado en todos los steps (Landing, Barbero, Servicio, Día, Hora, Datos, Confirmación); ProgressBar con gradient extendido y ring activo.
- **Login fix**: migrado a Server Action con `redirect('/panel')` server-side — elimina race condition de cookies que en algunos móviles caía a `/reservar`. `/login` ya autenticado autoredirige a `/panel`.
- **PWA fallback iOS**: detecta Safari iOS y muestra modal con instrucciones (Compartir → Añadir a pantalla de inicio) ya que iOS no dispara `beforeinstallprompt`. Android Chrome conserva el flujo nativo.
- **Icono PWA = gorila**: regenerados todos los iconos desde `gorila-logotipo 2.jpeg` con `trim()` del borde negro y ratio interno al 94 %.
- **Anti doble-reserva DB** (`004_anti_doble_reserva.sql`): `EXCLUDE USING gist` con `tstzrange [)` + `btree_gist` sobre `(empleado_id, rango)` parcial sobre `estado <> 'cancelada'`. RPC `crear_reserva_publica` captura `exclusion_violation` y devuelve `SLOT_OCUPADO`. App mapea a "Esa hora acaba de ocuparse, elige otra". Tested: cita normal ✓, solape ✗, contigua [10:30,11:00) ✓.
- **Email transaccional**: `nodemailer` + Gmail SMTP. Plantillas HTML con identidad black+gold + Playfair. Envío fire-and-forget tras INSERT exitoso. Cliente recibe confirmación (si dejó email), barbero recibe aviso con datos del cliente. Falla silencioso si las env no están — la reserva se crea igual. Necesita configurar en Vercel: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `EMAIL_FROM_NAME`, `BARBERO_EMAIL_DEFAULT`.
- RPC `crear_reserva_publica` (SECURITY DEFINER) resuelve limitaciones RLS del flujo anónimo.
- Middleware protege `/panel/*`; resto público.
- Preview desplegado en Vercel desde rama `feature/reservar-design`.
- Usuarios test:
  - `david.olid92@gmail.com` — propietario — pass `SkarTest2026!`
  - `test@skarbarber.local` — barbero

---

## Camino crítico para entregar a Raúl

> Lo mínimo para sustituir la ventana de mantenimiento y dejar la app operativa en manos del cliente.

### Bloqueado por Raúl (necesitamos info suya)
- [ ] Servicios y precios definitivos (lista cerrada).
- [ ] Política de cancelación (antelación mínima, sí/no).
- [ ] Teléfonos definitivos de Raúl y Darío (perfil + WhatsApp recordatorios).
- [ ] Fotos reales para `empleados.avatar_url` (Raúl + Darío).
- [ ] Dominio: `skarbarber.com` o `.es` — comprar (~12 €/año).

### Técnico pendiente (lo hacemos nosotros)
- [ ] **Configurar variables Gmail SMTP en Vercel** (David): `GMAIL_USER`, `GMAIL_APP_PASSWORD` (App Password 16 chars con 2FA), `EMAIL_FROM_NAME=Skarbarber`, `BARBERO_EMAIL_DEFAULT=david.olid92@gmail.com` → redeploy → probar reserva real.
- [ ] **Crear usuarios reales** en Supabase Auth (Raúl propietario, Darío barbero) y poblar fila `empleados`.
- [ ] **Actualizar seed** con servicios/precios reales una vez confirmados.
- [x] **Constraint DB anti doble reserva** (`004_anti_doble_reserva.sql`).
- [x] **Email transaccional** cliente + barbero (Gmail SMTP nodemailer, fire-and-forget).
- [x] **Fase 6 — PWA**: `manifest.ts`, iconos generados, service worker offline shell, install prompt con cooldown + fallback iOS.
- [ ] **Acceso barberos discreto** desde `/reservar` (link pequeño en footer hacia `/login`).
- [ ] **Decisión formato teléfono** (libre vs `+34` forzado) y aplicar regex en `/reservar` y panel.
- [ ] **QA end-to-end** en preview: reserva pública + email + alta manual + cambios de horario + métricas con datos reales.
- [ ] **Merge** `feature/reservar-design` → `main` y apuntar dominio a Vercel (sustituye la ventana de mantenimiento).
- [ ] *(diferible post-entrega)* **Fase 6 — Push al barbero** en nueva reserva (Supabase Realtime + Notification API). Aporta poco vs su complejidad en iOS — el email ya cumple ese rol.
- [ ] *(diferible)* **RPC `get_empleado_email`** (SECURITY DEFINER) para que el email del barbero se lea de `auth.users` cuando haya cuentas reales por barbero (ahora todos van a `BARBERO_EMAIL_DEFAULT`).

### Diferible post-entrega
- Recordatorios WhatsApp (Fase 3 — necesita verificación WhatsApp Business + Twilio).
- Editar cita ya creada (cambiar hora/servicio) — Fase 1.5.
- Link público de cancelación (`/cancelar/[token]`).
- "Añadir a calendario" (.ics / Google Calendar) en confirmación.

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
- [x] Validación de slots a nivel DB (`EXCLUDE USING gist` en migración `004`).
- [ ] Decisión política formato teléfono (+34 o libre).

### Panel admin `/panel`

> Ver desglose completo en [PLAN-DASHBOARD.md](PLAN-DASHBOARD.md).

**Fase 0 — Shell mobile-first** ✅
- [x] Renombrar `(dashboard)` → `panel` (resuelve conflicto de rutas `/`).
- [x] Middleware protege solo `/panel/*`, resto público.
- [x] Tokens CSS para efectos street/videogame: `pulse-gold`, `shimmer-cta`, `conic-border`.
- [x] Componentes base: `PanelCard`, `StatCard`, `ListItem`, `EmptyState`, `PageHeader`, `FabPlus`, `PanelHeader`, `BottomNav`.
- [x] Layout con backdrop atmosférico (radial gold + líneas scanline), header gorila 36px circular, bottom nav 4 items con indicador dorado.
- [x] Agenda placeholder con StatCards + lista de citas reales + efecto `pulse-gold` en siguiente cita + badge "Siguiente".
- [x] Placeholders `/panel/clientes`, `/panel/servicios`, `/panel/config`.

**Fase 1 — Agenda (core)** ✅
- [x] Navegación por fechas (flechas + chip "Hoy" + labels Hoy/Mañana/Ayer).
- [x] Filtros por empleado (Todos / Raúl / Darío) como pill tabs con gradient dorado activo.
- [x] Sheet de detalle al tocar cita: completar, cancelar, marcar no-asistió.
- [x] Estados visuales diferenciados: confirmada (pulse si próxima) / completada (tachado verde) / cancelada (grayscale rojo) / no_asistio (naranja).
- [x] Tap-to-call / WhatsApp desde la cita.
- [x] Server actions: `getCitasDelDia`, `actualizarEstadoCita`.
- [ ] Editar cita (cambiar hora/servicio/barbero) — aplazado a Fase 1.5.
- [ ] Swipe horizontal para cambiar de día — aplazado.
- [ ] Timeline vertical con tramos mañana/tarde — opcional.

**Fase 2 — Crear cita manual (FAB)** ✅
- [x] Sheet multi-step al pulsar FAB: barbero → servicio → día → hora → cliente.
- [x] Autocomplete de clientes existentes con debounce (220ms).
- [x] Opción walk-in (cliente sin registrar, marcado con sufijo).
- [x] Opción cliente nuevo (nombre + teléfono + email opcional, upsert por teléfono).
- [x] Server actions `buscarClientes` + `crearCitaManual`.
- [x] Validación de slot en servidor antes de insertar (evita carrera con reservas públicas).

**Fase 3 — Clientes** ✅
- [x] Listado ordenado por última visita + búsqueda con debounce (200ms).
- [x] Ficha cliente: historial cortes con estados, total gastado, notas internas.
- [x] Acciones: llamar, WhatsApp directo desde ficha.
- [x] Edición inline de nombre, teléfono, email, notas.
- [x] Eliminación con diálogo de confirmación.
- [x] Server actions `listarClientes`, `getClienteConHistorial`, `actualizarCliente`, `eliminarCliente`.
- [ ] Nueva cita pre-rellenada desde ficha (prefill) — aplazado a Fase 3.5.

**Fase 4 — Servicios / Empleados / Config** ✅
- [x] CRUD servicios (nombre, duración, precio, activo, orden) con sheet + confirmación de borrado.
- [x] Server actions `admin.ts` con RBAC (`requireUser`, `requirePropietario`, `getRolUsuario`, `getUsuarioActual`).
- [x] Página `/panel/config` con editor de horario laboral por día (toggle abierto/cerrado + hasta 3 tramos).
- [x] Datos del negocio (nombre/teléfono/dirección) con formulario dedicado y estado `readOnly` para barbero.
- [x] Edición de empleados desde config (propietario edita a todos + activo; barbero solo su propio perfil sin activo).

**Fase 5 — KPIs** ✅
- [x] 4 KPI cards (hoy, semana, ingresos mes, clientes nuevos) en `/panel/metricas`.
- [x] Gráfico ocupación semanal (barras CSS, 7 días lun-dom, % sobre capacidad total).
- [x] Top 5 clientes (por nº citas + total gastado) + Top 5 servicios del mes (veces vendido + ingresos).
- [x] RBAC: ingresos del mes solo visible para propietario.

**Fase 6 — PWA + notificaciones**
- [x] `app/manifest.ts` tipado con `MetadataRoute.Manifest` (start_url `/panel`, theme `#0a0a0a`, shortcuts a Agenda/Stats).
- [x] Iconos PWA generados desde `logo-2.png` con script `scripts/generate-pwa-icons.mjs` (192 / 512 / maskable-512 / apple-touch-180 / favicon-32+64).
- [x] `viewport` exportado en `layout.tsx` con `themeColor`, `colorScheme: dark`, `viewportFit: cover` + meta `appleWebApp` + `formatDetection.telephone:false`.
- [x] Service worker `public/sw.js` con cache versionado: HTML network-first → fallback `/offline.html`, assets estáticos stale-while-revalidate, passthrough para Supabase / `/api/*` / `/_next/data/`.
- [x] Página `public/offline.html` con estética del brand (gold gradient + Playfair).
- [x] `PWAInstallBridge` (cliente) registra el SW solo en producción y muestra un banner glass que captura `beforeinstallprompt`, con cooldown de 14 días al descartar.
- [x] **Fallback iOS Safari**: detección de iOS + modal con instrucciones (Compartir → Añadir a pantalla de inicio) ya que iOS no soporta `beforeinstallprompt`.
- [x] **Icono = gorila Skar Barber** (regenerado desde `gorila-logotipo 2.jpeg` con `trim()` y ratio 94%).
- [ ] Push al barbero en nueva reserva (Supabase Realtime + Notification API) — diferible post-entrega; el email ya notifica.

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

## Fase 2 — Emails transaccionales ✅

- [x] Proveedor MVP: Gmail SMTP con `nodemailer` (App Password). Migrar a Resend cuando haya dominio.
- [x] Plantilla de confirmación de cita al cliente (HTML negro+dorado + Playfair).
- [x] Email interno al barbero cuando entra nueva reserva (con tap-to-call y mailto cliente).
- [x] Disparo desde `crearReserva` tras éxito (fire-and-forget, no bloquea UX).
- [ ] Probar en preview con env vars configuradas en Vercel.
- [ ] Migrar a dominio propio + Resend cuando se compre el dominio.

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
- [supabase/migrations/003_negocio_update_policy.sql](supabase/migrations/003_negocio_update_policy.sql) — RLS UPDATE negocio para propietario.
- [supabase/migrations/004_anti_doble_reserva.sql](supabase/migrations/004_anti_doble_reserva.sql) — EXCLUDE constraint anti solape + RPC v2.
- [src/lib/email/](src/lib/email/) — transport Gmail SMTP + plantillas HTML + sender.
- [supabase/seed.sql](supabase/seed.sql) — datos iniciales.
- [src/lib/types.ts](src/lib/types.ts) — tipos TS del esquema.
- [src/lib/supabase/](src/lib/supabase/) — clientes Supabase.
- `.env.local` — credenciales (NO commitear).
