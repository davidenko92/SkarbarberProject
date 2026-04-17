-- ============================================
-- TABLA: tenants (multi-tenant ready)
-- ============================================
CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  phone         TEXT,
  address       TEXT,
  timezone      TEXT DEFAULT 'Europe/Madrid',
  business_hours JSONB NOT NULL DEFAULT '{
    "mon": {"open": "09:00", "close": "20:00"},
    "tue": {"open": "09:00", "close": "20:00"},
    "wed": {"open": "09:00", "close": "20:00"},
    "thu": {"open": "09:00", "close": "20:00"},
    "fri": {"open": "09:00", "close": "20:00"},
    "sat": {"open": "09:00", "close": "14:00"},
    "sun": null
  }'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLA: profiles (barberos / dueños)
-- ============================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'barber' CHECK (role IN ('owner', 'barber')),
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLA: clients (clientes de la barbería)
-- ============================================
CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, phone)
);

-- ============================================
-- TABLA: services (catálogo de servicios)
-- ============================================
CREATE TABLE services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  duration    INTEGER NOT NULL DEFAULT 30,
  price       DECIMAL(8,2) NOT NULL,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLA: appointments (citas)
-- ============================================
CREATE TABLE appointments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  barber_id   UUID NOT NULL REFERENCES profiles(id),
  service_id  UUID NOT NULL REFERENCES services(id),
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  status      TEXT NOT NULL DEFAULT 'confirmed'
              CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no_show')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_appointments_tenant_date
  ON appointments(tenant_id, starts_at)
  WHERE status != 'cancelled';

-- ============================================
-- TABLA: reminders (log de recordatorios)
-- ============================================
CREATE TABLE reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'sms')),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  scheduled_for   TIMESTAMPTZ NOT NULL,
  sent_at         TIMESTAMPTZ,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS: Row Level Security
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Helper: get tenant_id of current user
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: users see only their tenant
CREATE POLICY "tenant_isolation" ON profiles
  FOR ALL USING (tenant_id = get_user_tenant_id());

-- Clients: users see only their tenant's clients
CREATE POLICY "tenant_isolation" ON clients
  FOR ALL USING (tenant_id = get_user_tenant_id());

-- Services: users see only their tenant's services
CREATE POLICY "tenant_isolation" ON services
  FOR ALL USING (tenant_id = get_user_tenant_id());

-- Appointments: users see only their tenant's appointments
CREATE POLICY "tenant_isolation" ON appointments
  FOR ALL USING (tenant_id = get_user_tenant_id());

-- Reminders: users see only reminders for their tenant's appointments
CREATE POLICY "tenant_isolation" ON reminders
  FOR ALL USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE tenant_id = get_user_tenant_id()
    )
  );

-- ============================================
-- PUBLIC ACCESS: booking page (anon users)
-- Services and profiles are readable for booking
-- ============================================
CREATE POLICY "public_read_services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_barbers" ON profiles
  FOR SELECT USING (is_active = true);

-- Anon users can insert appointments (booking)
CREATE POLICY "public_create_appointment" ON appointments
  FOR INSERT WITH CHECK (true);

-- Anon users can insert clients (self-register when booking)
CREATE POLICY "public_create_client" ON clients
  FOR INSERT WITH CHECK (true);
