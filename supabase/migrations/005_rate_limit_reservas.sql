-- ============================================
-- RATE LIMIT por teléfono — defensa contra floods
-- ============================================
-- Limita el número de reservas activas que un mismo teléfono puede
-- crear en una ventana de 24h vía el endpoint público.
-- Bloquea spam/floods desde una misma identidad sin necesidad de
-- almacenamiento externo (Upstash, Redis): todo a nivel DB.

CREATE OR REPLACE FUNCTION crear_reserva_publica(
  p_empleado_id UUID,
  p_servicio_id UUID,
  p_inicio TIMESTAMPTZ,
  p_fin TIMESTAMPTZ,
  p_nombre TEXT,
  p_telefono TEXT,
  p_email TEXT DEFAULT NULL,
  p_notas TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id UUID;
  v_cita_id UUID;
  v_recientes INT;
  v_limite_24h CONSTANT INT := 5;
BEGIN
  -- 1) Rate limit: contar citas activas del mismo teléfono en últimas 24h.
  --    Se cuenta por cita creada (creado_en), no por hora de la cita,
  --    para que reservar varias citas distantes en el tiempo sí cuente.
  SELECT COUNT(*)
    INTO v_recientes
    FROM citas c
    JOIN clientes cl ON cl.id = c.cliente_id
   WHERE cl.telefono = p_telefono
     AND c.estado <> 'cancelada'
     AND c.creado_en > NOW() - INTERVAL '24 hours';

  IF v_recientes >= v_limite_24h THEN
    RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED'
      USING ERRCODE = 'P0001',
            HINT = 'Demasiadas reservas desde este teléfono. Inténtalo más tarde.';
  END IF;

  -- 2) Upsert cliente por teléfono.
  INSERT INTO clientes (nombre, telefono, email)
  VALUES (p_nombre, p_telefono, NULLIF(p_email, ''))
  ON CONFLICT (telefono) DO UPDATE
    SET nombre = EXCLUDED.nombre,
        email = COALESCE(EXCLUDED.email, clientes.email),
        actualizado_en = NOW()
  RETURNING id INTO v_cliente_id;

  -- 3) Insert cita con captura de solape.
  BEGIN
    INSERT INTO citas (cliente_id, empleado_id, servicio_id, inicio, fin, notas)
    VALUES (
      v_cliente_id,
      p_empleado_id,
      p_servicio_id,
      p_inicio,
      p_fin,
      NULLIF(p_notas, '')
    )
    RETURNING id INTO v_cita_id;
  EXCEPTION
    WHEN exclusion_violation THEN
      RAISE EXCEPTION 'SLOT_OCUPADO'
        USING ERRCODE = 'P0001',
              HINT = 'Esa hora ya está ocupada. Elige otra.';
  END;

  RETURN v_cita_id;
END;
$$;

COMMENT ON FUNCTION crear_reserva_publica IS
  'Crea reserva pública con (1) rate-limit por teléfono (5/24h) y '
  '(2) protección anti-solape vía EXCLUDE constraint.';
