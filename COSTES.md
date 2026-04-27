# Costes y suscripciones — Skarbarber

Registro de gastos realizados para el desarrollo y operación de la app, para trasladar al cliente.

**Última actualización:** 2026-04-22

---

## Resumen

| Concepto | Periodicidad | Coste estimado | Estado |
|---|---|---|---|
| Dominio `.com` / `.es` | Anual | ~12 € | Pendiente de compra |
| **TOTAL setup** | Una vez | 0,00 € | — |
| **TOTAL mensual** | Mensual | 0,00 € | Todo en free tier |
| **TOTAL anual** | Anual | ~12 € | Solo dominio pendiente |

---

## Infraestructura

### Vercel (hosting + CI/CD)
- **Plan:** Hobby (gratis)
- **Coste:** 0 €/mes
- **Límites:** 100 GB ancho de banda, deploys ilimitados en personal
- **Cuándo migrar a Pro (20 $/mes):** si el tráfico supera límites o se añaden colaboradores

### Supabase (BBDD + Auth + Storage)
- **Plan:** Free
- **Coste:** 0 €/mes
- **Límites:** 500 MB BBDD, 50.000 MAU, 1 GB storage, pausa tras 7 días inactivos
- **Cuándo migrar a Pro (25 $/mes):** cuando haya clientes reales y no se pueda permitir pausas

### GitHub
- **Plan:** Free (repo privado)
- **Coste:** 0 €/mes

---

## Servicios externos

### Dominio propio
- **Estado:** NO contratado — a comprar antes de producción
- **Coste estimado:** 10-15 €/año
- **Opciones recomendadas:**
  - Cloudflare Registrar — precio de coste (~9 €/año `.com`), sin upsells
  - Namecheap — ~11 €/año `.com`, incluye WhoisGuard
  - `.es` vía 1&1 / Nominalia — ~8-12 €/año
- **Nombres candidatos:** `skarbarber.com`, `skarbarber.es`, `skarbarber.app`
- **Uso:** producción (sustituye URL de Vercel), emails transaccionales Resend, branding

### Email transaccional
- **Estado:** NO decidido
- **Opciones evaluadas:**
  - Brevo free — 300 emails/día, 0 €/mes, sin dominio propio
  - Resend — 3.000 emails/mes gratis, requiere dominio verificado
  - Gmail SMTP — gratis, 500/día, peor deliverability

### WhatsApp recordatorios (Fase V1)
- **Estado:** NO implementado
- **Opciones:**
  - Twilio WhatsApp Business API — ~0,005 $/mensaje entrante, ~0,04 $/conversación saliente
  - n8n self-hosted — gratis si ya hay servidor propio

---

## Herramientas de desarrollo

### Claude Code (asistente IA)
- **Plan:** Max
- **Coste:** Asumido por David (no se traslada al cliente)

---

## Histórico de pagos

_Sin pagos realizados hasta la fecha._

| Fecha | Concepto | Importe | Proveedor | Factura |
|---|---|---|---|---|
| — | — | — | — | — |

---

## A decidir con el cliente

1. **Dominio:** ¿compra `skarbarber.com` / `skarbarber.es`? (~12 €/año)
2. **Email transaccional:** ¿Brevo free basta o preferimos Resend + dominio?
3. **Plan Supabase:** Free ahora, Pro (25 $/mes) antes de lanzar a público real
4. **WhatsApp:** Twilio de pago por uso vs n8n self-hosted en VPS (~5 €/mes Hetzner)
5. **Modelo de cobro:** ¿tarifa plana mensual al barbero o setup + mantenimiento?
