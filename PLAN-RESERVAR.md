# Plan — UI pública `/reservar`

## Análisis de los 6 mockups

### Design system detectado (consolidado de las 6 páginas)

- **Fondo**: negro (#000, #0a0a0a, #0f1011) con foto de barbería blurred (fachada o salón) + overlay oscuro 60-80%.
- **Acento gold**: `#C4A462` (primario), `#E5C171` (light), `#9A7B33` (dark). Gradientes dorados para CTAs.
- **Glassmorphism**: `rgba(255,255,255,0.03-0.08)` + `backdrop-blur(10-24px)` + `border 1px rgba(196,164,98,0.2-0.6)` (gold tinted).
- **Tipografía**: Playfair Display (serif, títulos grandes) + Inter (sans, body/UI).
- **Decoración**: líneas gold sutiles en esquinas + diagonales translúcidas de fondo.
- **Progress bar**: segmentos gold activos / gris inactivos, con contador `N/7`.
- **Botones**: pill shape con borde gold translúcido, CTAs principales con gradiente dorado sobre texto negro.

### Inconsistencias que decido unificar

- Pag 1 muestra 7 pasos (1/7), Pag 2 muestra 5 pasos (2/5). → Uso **7 pasos** (flow completo).
- Pag 4 tiene header blanco con nav superior (no cuadra con el resto). → Descarto ese header, mantengo la shell oscura con logo + progress del resto.
- Pag 4 mezcla día+hora+barbero en una sola. → La separo en pasos 4 (día) y 5 (hora) con el carousel horizontal de Pag 4 para el día y el grid de slots para la hora.
- Pag 3 enseña duraciones variadas (30/45/60 min). → Actualizar schema para usar la duración real del servicio (ya lo hace el código, solo seed).

### Flujo final (7 pasos)

| Paso | Pantalla | Diseño base |
|---|---|---|
| 1/7 | Landing | Pag 1 |
| 2/7 | Elegir barbero | Pag 2 |
| 3/7 | Elegir servicio | Pag 3 |
| 4/7 | Elegir día | carousel de Pag 4 (unificado al aesthetic de Pag 2/3) |
| 5/7 | Elegir hora | grid de slots de Pag 4 |
| 6/7 | Datos cliente | Pag 5 |
| 7/7 | Confirmación | Pag 6 |

## Arquitectura

### Estado

- Single page `/reservar` con componente cliente `BookingFlow` que mantiene estado local.
- `useReducer` con reducer tipado para transiciones entre pasos.
- Estado persistido en `sessionStorage` para sobrevivir a F5.
- Cada paso es un componente puro que recibe `state` + dispatch de acciones.

### Estructura de ficheros

```
src/app/reservar/
├── page.tsx                          # Server: fetch barberos + servicios + negocio
├── layout.tsx                        # Fonts Playfair + Inter
├── BookingFlow.tsx                   # Client: reducer + router de pasos
├── booking-reducer.ts                # Reducer tipado + acciones
├── components/
│   ├── ReservarShell.tsx             # Fondo, logo, progress bar, back btn
│   ├── ProgressBar.tsx
│   ├── BackButton.tsx
│   ├── GoldButton.tsx                # CTA principal con gradiente
│   ├── GlassCard.tsx                 # Card glassmorphism reutilizable
│   ├── BarberoCard.tsx
│   ├── ServicioCard.tsx
│   ├── DiaCarousel.tsx
│   └── HoraGrid.tsx
└── steps/
    ├── StepLanding.tsx
    ├── StepBarbero.tsx
    ├── StepServicio.tsx
    ├── StepDia.tsx
    ├── StepHora.tsx
    ├── StepDatos.tsx
    └── StepConfirmacion.tsx
```

### Fuentes

- `next/font/google` importa Playfair Display (700, 900) + Inter (400, 500, 600, 700) una sola vez en `layout.tsx`.
- CSS variables `--font-serif` / `--font-sans` registradas en `globals.css` bajo `@theme`.

### Assets

- **Logo**: `public/logo-2.png` (el que pidió el usuario).
- **Fondo**: `public/fachada-skarbarber.jpeg` (landing) + `public/salon-skarbarber.jpeg` (pasos internos) — alternar para que no sea monótono.
- **Barberos**: aún no hay fotos → fallback con avatar circular + iniciales sobre fondo gold translúcido. Dejar prop `avatar_url` lista para cuando las tengamos.

### Data flow

- Server component `page.tsx` hace `await getBarberosActivos()` + `await getServiciosActivos()` + `await getHorarioLaboral()` en paralelo con `Promise.all`.
- Pasa data al componente cliente `BookingFlow`.
- Slots se piden on-demand al seleccionar día: `useTransition` + llamada al server action `getSlotsDisponibles`.
- Submit final: `useActionState` con `crearReserva` → muestra Step 7 con el resultado.

### Responsive / accesibilidad

- Mobile-first. Max-width 430px center (igual que los mockups). En desktop: mismo contenedor con padding extra alrededor.
- Todos los tap targets ≥ 48px (ya viene en diseños).
- Labels semánticos en inputs, aria-label en back buttons.
- Respeta `prefers-reduced-motion` en transiciones de pasos.

## Pendientes fuera del alcance (para más adelante)

- Fotos reales de Raúl y Darío.
- Sync de estado a URL con shallow routing (por si el cliente comparte link del paso 3).
- "Añadir a calendario" (paso 7) → generar `.ics` o deep link a Google Calendar.
- Link de cancelación público (`/cancelar/[token]`) — requiere token en la cita.
- Recordatorio WhatsApp (Fase V1).

## Orden de implementación (esta sesión)

1. [ ] Instalar fuentes en `layout.tsx` del módulo `/reservar`.
2. [ ] Extender tailwind con tokens (gold, dark bg, radius).
3. [ ] Shell + ProgressBar + BackButton + GoldButton + GlassCard.
4. [ ] Reducer + BookingFlow.
5. [ ] StepLanding.
6. [ ] StepBarbero (con "Me da igual").
7. [ ] StepServicio.
8. [ ] StepDia (carousel horizontal + navegación entre semanas).
9. [ ] StepHora (grid con mañana/tarde agrupados).
10. [ ] StepDatos (formulario con validación client + server).
11. [ ] StepConfirmacion.
12. [ ] Prueba end-to-end en el dev server.
