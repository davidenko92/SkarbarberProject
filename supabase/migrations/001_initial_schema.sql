-- ============================================
-- TABLA: negocio (datos de la barbería)
-- ============================================
CREATE TABLE negocio (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          TEXT NOT NULL,
  telefono        TEXT,
  direccion       TEXT,
  zona_horaria    TEXT DEFAULT 'Europe/Madrid',
  horario_laboral JSONB NOT NULL DEFAULT '{
    "lun": [{"apertura": "10:00", "cierre": "14:00"}, {"apertura": "16:00", "cierre": "20:00"}],
    "mar": [{"apertura": "10:00", "cierre": "14:00"}, {"apertura": "16:00", "cierre": "20:00"}],
    "mie": [{"apertura": "10:00", "cierre": "14:00"}, {"apertura": "16:00", "cierre": "20:00"}],
    "jue": [{"apertura": "10:00", "cierre": "14:00"}, {"apertura": "16:00", "cierre": "20:00"}],
    "vie": [{"apertura": "10:00", "cierre": "14:00"}, {"apertura": "16:00", "cierre": "20:00"}],
    "sab": [{"apertura": "10:00", "cierre": "14:00"}],
    "dom": null
  }'::jsonb,
  creado_en       TIMESTAMPTZ DEFAULT now(),
  actualizado_en  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLA: empleados (barberos / dueños)
-- ============================================
CREATE TABLE empleados (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL,
  rol           TEXT NOT NULL DEFAULT 'barbero' CHECK (rol IN ('propietario', 'barbero')),
  telefono      TEXT,
  avatar_url    TEXT,
  activo        BOOLEAN DEFAULT true,
  creado_en     TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLA: clientes
-- ============================================
CREATE TABLE clientes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          TEXT NOT NULL,
  telefono        TEXT UNIQUE,
  email           TEXT,
  notas           TEXT,
  creado_en       TIMESTAMPTZ DEFAULT now(),
  actualizado_en  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLA: servicios (catálogo)
-- ============================================
CREATE TABLE servicios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  duracion      INTEGER NOT NULL DEFAULT 30,       -- minutos
  precio        DECIMAL(8,2) NOT NULL,             -- euros
  activo        BOOLEAN DEFAULT true,
  orden         INTEGER DEFAULT 0,
  creado_en     TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLA: citas
-- ============================================
CREATE TABLE citas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id      UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  empleado_id     UUID NOT NULL REFERENCES empleados(id),
  servicio_id     UUID NOT NULL REFERENCES servicios(id),
  inicio          TIMESTAMPTZ NOT NULL,
  fin             TIMESTAMPTZ NOT NULL,
  estado          TEXT NOT NULL DEFAULT 'confirmada'
                  CHECK (estado IN ('confirmada', 'completada', 'cancelada', 'no_asistio')),
  notas           TEXT,
  creado_en       TIMESTAMPTZ DEFAULT now(),
  actualizado_en  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_citas_fecha
  ON citas(inicio)
  WHERE estado != 'cancelada';

-- ============================================
-- TABLA: recordatorios (log de envíos)
-- ============================================
CREATE TABLE recordatorios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cita_id         UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
  canal           TEXT NOT NULL CHECK (canal IN ('whatsapp', 'email', 'sms')),
  estado          TEXT NOT NULL DEFAULT 'pendiente'
                  CHECK (estado IN ('pendiente', 'enviado', 'fallido', 'entregado')),
  programado_para TIMESTAMPTZ NOT NULL,
  enviado_en      TIMESTAMPTZ,
  mensaje_error   TEXT,
  creado_en       TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS: Row Level Security
-- ============================================
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordatorios ENABLE ROW LEVEL SECURITY;

-- Empleados autenticados: acceso total
CREATE POLICY "acceso_empleados" ON empleados
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "acceso_empleados" ON clientes
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "acceso_empleados" ON servicios
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "acceso_empleados" ON citas
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "acceso_empleados" ON recordatorios
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================
-- ACCESO PÚBLICO: página de reservas (usuarios anónimos)
-- ============================================
CREATE POLICY "lectura_publica_servicios" ON servicios
  FOR SELECT USING (activo = true);

CREATE POLICY "lectura_publica_empleados" ON empleados
  FOR SELECT USING (activo = true);

-- Anónimos pueden crear citas (reservar)
CREATE POLICY "crear_cita_publica" ON citas
  FOR INSERT WITH CHECK (true);

-- Anónimos pueden crear clientes (auto-registro al reservar)
CREATE POLICY "crear_cliente_publico" ON clientes
  FOR INSERT WITH CHECK (true);
