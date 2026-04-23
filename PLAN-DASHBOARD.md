# Plan de acción — Dashboard admin Skarbarber

> App **mobile-first** de gestión para Raúl (owner), Darío y futuros compañeros. Se usa desde el móvil detrás del espejo mientras cortan. PWA instalable. Coherente visualmente con `/reservar`.

**Creado:** 2026-04-23
**Estado:** Dashboard actual es un scaffold casi vacío (`/(dashboard)/page.tsx` con placeholder "Agenda de hoy").

## Principio rector

**El móvil es el primer (y casi único) dispositivo.** Raúl revisa la agenda en el móvil entre cliente y cliente. Decisiones de diseño:

- Tap targets ≥48px, separación ≥12px (están con guantes o manos ocupadas a veces).
- Todo accesible con pulgar derecho en el tercio inferior de la pantalla.
- Bottom nav persistente, FAB para acción primaria.
- Desktop es un "lujo" — responsive pero no prioritario.
- Offline-first donde sea posible (agenda del día cacheada).
- Textos grandes (body 16px mínimo) para lectura rápida.

---

## Decisiones de diseño

Basado en recomendaciones de `ui-ux-pro-max` adaptadas a la identidad Skarbarber:

- **Logo:** `public/gorila-logotipo 2.jpeg` (gorila boxeador con lema *Familia · Respeto · Humildad*). Es el logo del equipo, más street que el elegante de `/reservar`. Se usa en:
  - Splash / login.
  - Header compacto del dashboard (versión reducida, círculo 36-40px).
  - Icono PWA.
  Como el fondo del logo es ya negro puro, encaja natural sobre el fondo del dashboard sin bordes.
- **Paleta:** negro (#000/#0a0a0a) + gold (#c4a462) como en `/reservar`. Descartamos la sugerencia pink/blue del skill.
- **Tipografía:** Playfair Display (títulos) + Inter (UI/body). Ya cargadas globalmente. La tipografía gótica del logo queda solo como asset, no se reutiliza en UI.
- **Estilo:** dark mode OLED + glassmorphism sutil (ya tenemos `.edge-card`). WCAG AA mínimo. Más denso y funcional que `/reservar` — aquí el barbero trabaja, no admira.
- **Iconos:** `lucide-react`. Stroke 1.5, tokens sm=20, md=24, lg=28 (un poco más grandes que en web estándar por uso con manos).
- **Layout:** mobile-first puro. Bottom nav (4 items), FAB para "nueva cita", safe-areas top/bottom, content padding 16px lateral. Sidebar desktop es bonus.
- **Gráficos:** ocupación por día (barras horizontales), KPIs como cards numéricas. Recharts o visx (decisión al llegar a Fase 5).

### Efectos "street / videogame" (elegidos)

Tres efectos cohesivos, todos puro CSS/transform — cero librerías pesadas, 60fps garantizados:

1. **Border pulse gold en cita activa/siguiente** — animación `box-shadow` pulsando 2-3s, simula "cursor seleccionado" de menú de videojuego. Aplicar solo a la próxima cita del día para guiar la atención.
2. **Shimmer gold en CTAs** — gradiente lineal barriendo el botón cada 3s, con `mask` para contenerlo al borde. Aplicar a FAB "+ Cita" y botones primarios.
3. **Bordes gradient-conic rotando en elementos seleccionados** — `background: conic-gradient` rotando lento (8s) en el borde de tabs activos, empleado filtrado, día seleccionado. Da sensación de "slot activo".

Todos respetan `prefers-reduced-motion`: pulse y rotación se detienen, shimmer desaparece.

---

## Arquitectura de rutas

**Decisión tomada:** el dashboard vive en `/panel/*`. El barbero no ve URLs (PWA), pero internamente se separa limpio del flujo público.

```
src/app/
├── page.tsx                   # / → redirect /reservar (cliente)
├── reservar/...               # Web pública de citas
├── login/                     # Login (público)
└── panel/                     # Dashboard admin (auth + PWA)
    ├── layout.tsx             # Shell: header + bottom nav
    ├── page.tsx               # /panel → Agenda (home del admin)
    ├── clientes/
    │   ├── page.tsx           # /panel/clientes
    │   └── [id]/page.tsx      # /panel/clientes/[id]
    ├── servicios/page.tsx     # /panel/servicios
    ├── empleados/page.tsx     # /panel/empleados (solo owner)
    └── config/page.tsx        # /panel/config
```

- `manifest.json` usa `start_url: "/panel"` — la PWA instalada abre directamente la agenda.
- Middleware protege todo `/panel/*` con auth.
- Se elimina el grupo `(dashboard)` y se renombra a `panel` en Fase 0.

---

## Fases

### Fase 0 — Preparar shell mobile (1 sesión)

- [ ] Renombrar `src/app/(dashboard)` → `src/app/panel` y borrar layout/page obsoletos.
- [ ] Actualizar middleware: proteger `/panel/*` (ya no redirige `/` a login).
- [ ] Rediseñar `layout.tsx` del grupo dashboard con identidad gold + Playfair.
- [ ] Header compacto: logo gorila (36px circular) + título página + botón avatar/logout.
- [ ] Bottom nav móvil fijo (4 items con icono + label): Agenda · Clientes · Servicios · Config.
  - Fondo glass con blur, safe-area bottom inset.
  - Estado activo con subrayado gold + icon filled.
- [ ] FAB bottom-right (solo en Agenda): gradiente gold, sombra, icon `Plus`.
- [ ] Sidebar desktop (≥1024px) con mismos 4 items (bonus).
- [ ] Componentes base compartidos:
  - `AppShell` — wrapper con header + content + bottom nav
  - `PageHeader` — título + acciones contextuales
  - `GlassPanel` — card base glassmorphism
  - `GoldBadge` — badge con acento gold (estados)
  - `StatCard` — KPI card con número grande + label
  - `ListItem` — item de lista tap-friendly con left icon/avatar + content + chevron
  - `EmptyState` — mensaje vacío con icono + CTA
  - `ActionSheet` — bottom sheet modal para acciones

### Fase 1 — Agenda (core)

**Pantalla más usada. Raúl mira esto 20 veces al día.**

- [ ] Vista por día con timeline vertical (mañana 10-14h, tarde 16-20h).
- [ ] Cada cita = tarjeta glass con: hora, cliente, servicio, duración, teléfono (tap → llamar).
- [ ] Filtrar por empleado (tabs: Todos · Raúl · Darío).
- [ ] Navegación por fechas: swipe lateral móvil + flechas desktop + date picker.
- [ ] Botón flotante "+ Cita manual" (bottom-right, estilo FAB con gradiente gold).
- [ ] Estados de cita: confirmada (gold), completada (neutro), cancelada (tachado + rojo).
- [ ] Tap en cita → sheet/modal con detalles + acciones (editar, cancelar, marcar completada).
- [ ] Server actions: `getCitasDelDia`, `actualizarCita`, `cancelarCita`.

### Fase 2 — Crear/editar cita manual

- [ ] Formulario multi-step (similar a `/reservar` pero desde el admin).
- [ ] Autocomplete de clientes existentes por teléfono/nombre.
- [ ] Opción rápida "cliente sin registrar" (walk-in).
- [ ] Validación de solape con citas existentes (ya cubierto por RPC).
- [ ] Server action: `crearCitaManual`.

### Fase 3 — Clientes

- [ ] Listado ordenado por última visita.
- [ ] Búsqueda por nombre/teléfono (debounce 300ms).
- [ ] Tap → ficha: historial de citas, total gastado, nota interna editable.
- [ ] Acciones rápidas: llamar, WhatsApp directo, "Nueva cita".
- [ ] Server actions: `getClientes`, `getClienteById`, `updateCliente`.

### Fase 4 — Servicios + Empleados + Config

- [ ] Servicios: tabla con nombre, duración, precio, activo. Crear/editar/desactivar.
- [ ] Empleados (solo owner): avatar, nombre, teléfono, activo. Crear/editar/desactivar.
- [ ] Config negocio: nombre, dirección, teléfono, horario laboral (editor de tramos por día).
- [ ] Server actions: CRUD de cada entidad.

### Fase 5 — KPIs y estadísticas (opcional MVP)

- [ ] Dashboard con 4 KPI cards: citas hoy, citas semana, ingresos mes, clientes nuevos mes.
- [ ] Gráfico de ocupación semanal (barras horizontales, días de la semana).
- [ ] Top 5 clientes por frecuencia.
- [ ] Top 3 servicios del mes.

### Fase 6 — PWA + notificaciones

- [ ] `manifest.json` con `start_url: "/panel"`, theme_color `#c4a462`, background_color `#000`.
- [ ] Iconos PWA generados desde el logo gorila (192, 512, maskable).
- [ ] Service worker básico (cache shell + agenda del día offline).
- [ ] Prompt de instalación (iOS/Android) la primera vez que el barbero entra.
- [ ] Notificaciones push al barbero cuando entra nueva reserva pública (Supabase Realtime + Web Push API).

---

## Pautas UX aplicadas (checklist `ui-ux-pro-max`)

- **Accesibilidad:** contraste 4.5:1, focus rings visibles, aria-labels en iconos.
- **Touch:** targets ≥44px, separación ≥8px, feedback <100ms.
- **Performance:** Server Components por defecto, virtualización si listas >50 items.
- **Navegación:** bottom nav ≤5, estado activo marcado, back consistente.
- **Forms:** labels visibles, error bajo campo, validación on-blur, autocomplete nativo.
- **Motion:** 150-300ms, respeta `prefers-reduced-motion`.

---

## Orden de implementación sugerido (esta sesión)

1. **Fase 0** (shell + componentes base) — 1 sesión completa.
2. **Fase 1** (agenda lectura) — 1 sesión.
3. **Fase 2** (crear cita manual) — 1 sesión.
4. **Fase 3** (clientes) — 1 sesión.
5. **Fase 4** (CRUD servicios/empleados/config) — 1 sesión.
6. Posponer Fases 5-6 hasta validar con Raúl que el MVP funciona.
